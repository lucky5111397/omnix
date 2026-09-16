#!/usr/bin/env node

/**
 * OMNIX Local Pre-Commit Secret Scanner
 *
 * Scans staged files and diffs before commit to prevent accidental leaks.
 * If gitleaks is installed in PATH, it leverages `gitleaks protect --staged`.
 * Otherwise, it executes high-fidelity regex pattern scanning on staged diffs.
 *
 * Strictly blocks:
 * - Private Keys (RSA, EC, DSA, OpenSSH, PGP)
 * - AWS Credentials
 * - GitHub Personal Access Tokens
 * - Firebase Service Account Keys
 * - Stripe / Razorpay Live Keys
 * - Database Connection Strings with Passwords
 * - Staged .env or service account key files
 *
 * Guarantees:
 * - 100% Free / Open-Source (zero SaaS / zero cost).
 * - Never prints raw secret values in output (always masked).
 */

import { execSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";

const isStagedOnly = process.argv.includes("--staged");
const fileArgIndex = process.argv.indexOf("--file");
const targetFile = fileArgIndex !== -1 ? process.argv[fileArgIndex + 1] : null;

function hasGitleaks() {
  try {
    const res = spawnSync("gitleaks", ["version"], { stdio: "ignore" });
    return res.status === 0;
  } catch {
    return false;
  }
}

// Check if gitleaks binary is available
if (hasGitleaks()) {
  console.log("[SecretScan] Running native gitleaks protect on staged changes...");
  try {
    execSync("gitleaks protect --staged -v", { stdio: "inherit" });
    console.log("✅ Gitleaks check passed.");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Gitleaks blocked commit due to detected secrets.");
    process.exit(1);
  }
}

// High-fidelity patterns (pattern name -> regex)
const SECRET_PATTERNS = [
  {
    name: "Private Key Header",
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/,
  },
  {
    name: "AWS Access Key ID",
    regex: /\b(AKIA[0-9A-Z]{16})\b/,
  },
  {
    name: "GitHub Personal Access Token",
    regex: /\b(gh[pousr]_[A-Za-z0-9_]{36,255})\b/,
  },
  {
    name: "Razorpay Live Secret",
    regex: /\b(rzp_live_[0-9a-zA-Z]{14,})\b/,
  },
  {
    name: "Stripe Live Secret Key",
    regex: /\b(sk_live_[0-9a-zA-Z]{24,})\b/,
  },
  {
    name: "Google / Firebase Service Account Key",
    regex: /"type":\s*"service_account"[\s\S]{1,200}"private_key":/,
  },
  {
    name: "Database URI with Password",
    regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql):\/\/[^:\s'"]+:[^@\s'"]+@/,
  },
  {
    name: "Generic API/Secret Key Assignment",
    regex: /(?:api[_-]?key|secret[_-]?key|private[_-]?key|auth[_-]?token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{24,}['"]/i,
  },
];

// Blocked filenames if accidentally staged
const BLOCKED_FILENAMES = [
  /^\.env(?:\.(?!example$).+)?$/i,
  /^serviceAccountKey\.json$/i,
  /^id_rsa$/i,
  /^id_ed25519$/i,
];

// Safe placeholder values to ignore
const SAFE_PLACEHOLDERS = [
  "your_secret_here",
  "placeholder",
  "test_secret",
  "mock-key",
  "mock-project",
  "mock-email",
  "mockkey",
  "example",
  "dummy",
  "[REDACTED]",
  "YOUR_KEY",
];

function isSafe(line) {
  const lower = line.toLowerCase();
  return SAFE_PLACEHOLDERS.some((p) => lower.includes(p.toLowerCase()));
}

function mask(value) {
  if (!value || value.length <= 6) return "******";
  return value.slice(0, 3) + "..." + value.slice(-3);
}

try {
  let filesToScan = [];
  let isDirectFile = false;

  if (targetFile) {
    if (!fs.existsSync(targetFile)) {
      console.error(`Target file does not exist: ${targetFile}`);
      process.exit(1);
    }
    filesToScan = [targetFile];
    isDirectFile = true;
  } else {
    const stagedFilesOutput = execSync(
      "git diff --cached --name-only --diff-filter=ACM",
      { encoding: "utf-8" }
    ).trim();

    if (!stagedFilesOutput) {
      console.log("ℹ️ No staged files to scan.");
      process.exit(0);
    }
    filesToScan = stagedFilesOutput.split(/\r?\n/).filter(Boolean);
  }

  let violationCount = 0;

  for (const file of filesToScan) {
    const baseName = path.basename(file);

    // 1. Check for blocked filenames
    for (const pattern of BLOCKED_FILENAMES) {
      if (pattern.test(baseName)) {
        console.error(`\n❌ [BLOCKED FILE] Sensitive file must not be committed: ${file}`);
        violationCount++;
      }
    }

    // 2. Check content (either direct file content or staged diff)
    try {
      let lines = [];
      if (isDirectFile) {
        lines = fs.readFileSync(file, "utf-8").split(/\r?\n/);
      } else {
        const diff = execSync(`git diff --cached --unified=0 -- "${file}"`, {
          encoding: "utf-8",
        });
        lines = diff
          .split(/\r?\n/)
          .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
          .map((l) => l.substring(1));
      }

      for (let i = 0; i < lines.length; i++) {
        const content = lines[i].trim();
        if (isSafe(content)) continue;

        for (const { name, regex } of SECRET_PATTERNS) {
          const match = regex.exec(content);
          if (match) {
            console.error(
              `\n❌ [SECRET DETECTED] ${name} found in file: ${file}:${i + 1}`
            );
            console.error(`   Preview: ${mask(match[0])}`);
            violationCount++;
          }
        }
      }
    } catch {
      // Ignore binary diff/read errors
    }
  }

  if (violationCount > 0) {
    console.error(
      `\n🚫 Secret scanning failed: Found ${violationCount} potential secret(s). Please unstage or redact.\n`
    );
    process.exit(1);
  }

  console.log(`✅ Secret scanning passed: ${filesToScan.length} file(s) clean.`);
  process.exit(0);
} catch (err) {
  console.error("Error executing secret scan:", err.message);
  process.exit(1);
}
