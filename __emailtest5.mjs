import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import "dotenv/config";

const B = "http://localhost:3001";
const H = { "x-test-bypass": "khelovani-test-2026", "Content-Type": "application/json" };
const c = new MongoClient(process.env.MONGODB_URL_TEST);
await c.connect();
const db = c.db();

const partner = await db.collection("organisations").findOne({
  status: "APPROVED", isShown: true, email: { $exists: true, $ne: "" },
});
console.log("partner:", partner._id.toString(), partner.email);

const idNumber = String(Date.now()).slice(0, 11);
const email = `emailtest5_${idNumber}@test.com`;
await db.collection("users").insertOne({
  email, password: await bcrypt.hash("StrongPassword123!", 10), nameEn: "Email Retest",
  idNumber, phone: "555000111", isVerified: true, isActive: true, createdAt: new Date(), updatedAt: new Date(),
});

const login = await fetch(`${B}/api/user/login`, {
  method: "POST", headers: H, body: JSON.stringify({ email, password: "StrongPassword123!" }),
});
const setCookie = login.headers.get("set-cookie") || "";
const cookieHeader = setCookie.split(",").map((c) => c.trim().split(";")[0]).join("; ");
console.log("login:", login.status);

const res = await fetch(`${B}/api/partner/${partner._id}/reviews`, {
  method: "POST",
  headers: { ...H, Cookie: cookieHeader },
  body: JSON.stringify({ rating: 5, comment: "Second email delivery check after Brevo IP allowlist update." }),
});
console.log("create review:", res.status);

await db.collection("users").deleteOne({ email });
await c.close();
console.log("DONE");
process.exit(0);
