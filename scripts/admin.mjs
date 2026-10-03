import { scriptFirebase } from "./firebase.mjs";

const [, , command, email] = process.argv;
if (!["grant", "revoke"].includes(command) || !email?.includes("@")) {
  console.error("Usage: npm run admin:grant -- grant admin@example.com\n       npm run admin:grant -- revoke admin@example.com");
  process.exitCode = 1;
} else {
  try {
    const { auth } = scriptFirebase();
    const user = await auth.getUserByEmail(email);
    const claims = { ...user.customClaims };
    if (command === "grant") claims.admin = true; else delete claims.admin;
    await auth.setCustomUserClaims(user.uid, claims);
    await auth.revokeRefreshTokens(user.uid);
    console.log(`Admin access ${command === "grant" ? "granted" : "revoked"} for ${email}. Sign out and sign in again.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Could not update the admin claim.");
    process.exitCode = 1;
  }
}
