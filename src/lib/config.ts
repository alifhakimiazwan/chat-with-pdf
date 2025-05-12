import fs from "fs";

function setupGoogleCredentials() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
    throw new Error("Google credentials not found in environment variables");
  }

  const credentialsPath = "/tmp/google-credentials.json";
  const buffer = Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    "base64"
  );

  fs.writeFileSync(credentialsPath, buffer);

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}

setupGoogleCredentials();
