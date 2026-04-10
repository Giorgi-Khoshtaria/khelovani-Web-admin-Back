import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const UserSchema = new mongoose.Schema(
  {
    idNumber: String, nameGe: String, nameEn: String, dateOfBirth: Date,
    city: String, address: String, email: String, phone: String,
    password: String, isVerified: Boolean, isActive: Boolean,
  },
  { timestamps: true },
);

const User = mongoose.models?.User || mongoose.model("User", UserSchema);
const ORGANIZER_EMAIL = "xoshtagio@gmail.com";
const ORGANIZER_PASSWORD = "TestPass123!";

mongoose.connect(process.env.MONGODB_URL_TEST as string).then(async () => {
  const hashed = await bcrypt.hash(ORGANIZER_PASSWORD, 10);
  const existing = await User.findOne({ email: ORGANIZER_EMAIL });
  if (existing) {
    existing.password = hashed;
    existing.isVerified = true;
    await existing.save();
    console.log("✅ Organizer updated & verified.");
  } else {
    await User.create({
      idNumber: "12345678901", nameGe: "ტესტ ორგ", nameEn: "Test Org",
      dateOfBirth: new Date("1990-01-01"), city: "tbilisi",
      address: "Test Address 123", email: ORGANIZER_EMAIL,
      phone: "555123456", password: hashed, isVerified: true, isActive: true,
    });
    console.log("✅ Organizer created: " + ORGANIZER_EMAIL);
  }
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
