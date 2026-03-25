import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    idNumber: {
      type: String,
      required: true,
      unique: true,
      minlength: 11,
      maxlength: 11,
    },
    nameGe: {
      type: String,
      required: false,
      trim: true,
    },
    nameEn: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    city: {
      type: String,
      required: true,
      enum: ["tbilisi", "batumi", "kutaisi", "rustavi", "gori", "zugdidi"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: false,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
export default User;
