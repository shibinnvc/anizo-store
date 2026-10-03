import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// The emulator project and endpoints are fixed so this suite cannot mutate live content.
// Snapshot rules outside cloud-synced folders so hydration events cannot restart
// the rules watcher before the emulator has finished starting.
const configDirectory = mkdtempSync(join(tmpdir(), "anizo-workflows-"));
const config = JSON.parse(readFileSync(resolve("firebase.json"), "utf8"));
for (const [service, key] of [["firestore", "rules"], ["firestore", "indexes"], ["storage", "rules"]]) {
  const target = join(configDirectory, `${service}-${key}`);
  writeFileSync(target, readFileSync(resolve(config[service][key])));
  config[service][key] = target;
}
const configPath = join(configDirectory, "firebase.json");
writeFileSync(configPath, JSON.stringify(config));
const result = spawnSync(resolve("node_modules/.bin/firebase"), ["emulators:exec", "--config", configPath, "--only", "auth,firestore,storage", "--project", "demo-anizo", "npm run test:e2e"], {
  stdio: "inherit",
  env: {
    ...process.env,
    FIREBASE_PROJECT_ID: "demo-anizo",
    FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
    FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
    FIREBASE_STORAGE_EMULATOR_HOST: "127.0.0.1:9199",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-anizo.appspot.com",
    GOOGLE_APPLICATION_CREDENTIALS: "",
    FIREBASE_CLIENT_EMAIL: "",
    FIREBASE_PRIVATE_KEY: "",
    TEST_BASE_URL: "",
  },
});
rmSync(configDirectory, { recursive: true, force: true });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
