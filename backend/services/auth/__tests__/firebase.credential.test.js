import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import {
  resolveFirebaseCredential,
  resolveFirebaseProjectId,
  getFirebaseDiagnostics,
} from "../config/firebase.js";

describe("SEC-01 Firebase Credential & Project ID Hardening", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.FIREBASE_SERVICE_ACCOUNT;
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    delete process.env.GOOGLE_CLOUD_PROJECT;
    delete process.env.GCLOUD_PROJECT;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should resolve project ID from FIREBASE_PROJECT_ID", () => {
    process.env.FIREBASE_PROJECT_ID = "test-project-123";
    expect(resolveFirebaseProjectId()).toBe("test-project-123");
  });

  it("should resolve project ID from GOOGLE_CLOUD_PROJECT fallback", () => {
    process.env.GOOGLE_CLOUD_PROJECT = "gcp-project-456";
    expect(resolveFirebaseProjectId()).toBe("gcp-project-456");
  });

  it("should resolve project ID from serviceAccount object if env vars absent", () => {
    const mockSa = { project_id: "sa-project-789" };
    expect(resolveFirebaseProjectId(mockSa)).toBe("sa-project-789");
  });

  it("should return undefined when no project ID is configured", () => {
    expect(resolveFirebaseProjectId()).toBeUndefined();
  });

  it("should handle missing or invalid FIREBASE_SERVICE_ACCOUNT safely without crashing", () => {
    process.env.FIREBASE_SERVICE_ACCOUNT = "not-a-valid-json-string";
    const credential = resolveFirebaseCredential();
    expect(credential).toBeDefined();
  });

  it("should fall back gracefully when individual env vars fail parsing", () => {
    process.env.FIREBASE_PROJECT_ID = "mock-project";
    process.env.FIREBASE_CLIENT_EMAIL = "mock-email@example.com";
    process.env.FIREBASE_PRIVATE_KEY = "malformed-key";

    const credential = resolveFirebaseCredential();
    expect(credential).toBeDefined();
  });

  it("should configure cert credential with individual env vars using synthetic RSA key", () => {
    const { privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    process.env.FIREBASE_PROJECT_ID = "synthetic-proj";
    process.env.FIREBASE_CLIENT_EMAIL = "synthetic@test.iam.gserviceaccount.com";
    process.env.FIREBASE_PRIVATE_KEY = privateKey;

    const credential = resolveFirebaseCredential();
    expect(credential).toBeDefined();
    expect(credential.projectId).toBe("synthetic-proj");
    expect(credential.clientEmail).toBe("synthetic@test.iam.gserviceaccount.com");
  });

  it("should configure cert credential with base64 encoded FIREBASE_SERVICE_ACCOUNT", () => {
    const { privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    const mockSa = {
      project_id: "base64-proj",
      client_email: "base64@test.iam.gserviceaccount.com",
      private_key: privateKey,
    };

    process.env.FIREBASE_SERVICE_ACCOUNT = Buffer.from(JSON.stringify(mockSa)).toString("base64");

    const credential = resolveFirebaseCredential();
    expect(credential).toBeDefined();
    expect(credential.projectId).toBe("base64-proj");
    expect(credential.clientEmail).toBe("base64@test.iam.gserviceaccount.com");
  });

  it("should provide accurate diagnostics reflecting credential and project state without leaking secrets", () => {
    const diagEmpty = getFirebaseDiagnostics();
    expect(diagEmpty.hasProjectId).toBe(false);
    expect(diagEmpty.hasServiceAccountEnv).toBe(false);
    expect(diagEmpty.hasIndividualVars).toBe(false);

    process.env.FIREBASE_PROJECT_ID = "diag-proj";
    const diagWithProject = getFirebaseDiagnostics();
    expect(diagWithProject.hasProjectId).toBe(true);
    expect(diagWithProject.configuredProjectId).toBe("diag-proj");
  });
});
