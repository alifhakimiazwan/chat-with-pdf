import { Client } from "pg";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

client
  .connect()
  .then(() => {
    console.log("✅ Connected to Neon!");
    return client.end();
  })
  .catch((err) => {
    console.error("❌ Neon connection error:", err);
  });
