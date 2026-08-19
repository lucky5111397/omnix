import { initializeApp, cert } from "firebase-admin/app";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(
    new URL("../../../serviceAccountKey.json", import.meta.url)
  )
);

export const app = initializeApp({
  credential: cert(serviceAccount),
});