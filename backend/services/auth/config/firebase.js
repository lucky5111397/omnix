import { initializeApp, cert, applicationDefault, getApps, getApp } from "firebase-admin/app";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

/**
 * SEC-01: Hardened Firebase Admin Credential Loader
 *
 * Supports:
 * 1. FIREBASE_SERVICE_ACCOUNT env var (raw JSON or base64 JSON string)
 * 2. Individual env vars (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 3. Local serviceAccountKey.json file fallback (for local development)
 * 4. Google Application Default Credentials (ADC) via applicationDefault()
 *
 * Security guarantees:
 * - Real credentials are never hardcoded or printed to stdout/stderr.
 * - Production containers do not require baking serviceAccountKey.json into images.
 */
export function resolveFirebaseProjectId(serviceAccount) {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    serviceAccount?.project_id ||
    serviceAccount?.projectId ||
    undefined
  );
}

export function resolveFirebaseCredential() {
  // Option 1: Full JSON string or base64 encoded JSON in environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      const jsonStr = raw.startsWith("{")
        ? raw
        : Buffer.from(raw, "base64").toString("utf-8");
      const serviceAccount = JSON.parse(jsonStr);
      return cert(serviceAccount);
    } catch (err) {
      console.error("[SEC-01] Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:", err.message);
    }
  }

  // Option 2: Individual environment variables
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    try {
      return cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      });
    } catch (err) {
      console.error("[SEC-01] Failed to configure Firebase cert from individual env vars:", err.message);
    }
  }

  // Option 3: Local file check (development only)
  try {
    const localFilePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : fileURLToPath(new URL("../../../serviceAccountKey.json", import.meta.url));

    if (fs.existsSync(localFilePath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(localFilePath, "utf-8"));
      return cert(serviceAccount);
    }
  } catch (err) {
    console.warn("[SEC-01] Local service account key file not loaded:", err.message);
  }

  // Option 4: Google Application Default Credentials (ADC) / Platform-provided credentials
  try {
    return applicationDefault();
  } catch {
    return undefined;
  }
}

export function getFirebaseDiagnostics() {
  const hasServiceAccountEnv = !!process.env.FIREBASE_SERVICE_ACCOUNT;
  const hasIndividualVars = !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
  const hasLocalPath = !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const projectId = resolveFirebaseProjectId();

  return {
    hasServiceAccountEnv,
    hasIndividualVars,
    hasLocalPath,
    hasProjectId: !!projectId,
    configuredProjectId: projectId || null,
  };
}

const resolvedProjectId = resolveFirebaseProjectId();
if (resolvedProjectId) {
  if (!process.env.GOOGLE_CLOUD_PROJECT) {
    process.env.GOOGLE_CLOUD_PROJECT = resolvedProjectId;
  }
  if (!process.env.GCLOUD_PROJECT) {
    process.env.GCLOUD_PROJECT = resolvedProjectId;
  }
}

const credential = resolveFirebaseCredential();

// Safe diagnostic log without printing secret contents
const diagnostics = getFirebaseDiagnostics();
if (!diagnostics.hasServiceAccountEnv && !diagnostics.hasIndividualVars && !diagnostics.hasLocalPath) {
  console.info("[SEC-01] Firebase Auth initialized with ADC fallback mode:", {
    FIREBASE_SERVICE_ACCOUNT: diagnostics.hasServiceAccountEnv ? "present" : "absent",
    FIREBASE_INDIVIDUAL_VARS: diagnostics.hasIndividualVars ? "present" : "absent",
    FIREBASE_PROJECT_ID: diagnostics.hasProjectId ? "configured" : "missing",
  });
}

let firebaseApp;
try {
  const appOptions = {
    ...(credential ? { credential } : {}),
    ...(resolvedProjectId ? { projectId: resolvedProjectId } : {}),
  };

  firebaseApp = getApps().length > 0
    ? getApp()
    : initializeApp(appOptions);
} catch (error) {
  console.warn("[SEC-01] Firebase initialization deferred:", error.message);
}

export const app = firebaseApp;
export default app;