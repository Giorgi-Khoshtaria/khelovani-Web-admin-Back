import mongoose from "mongoose";

const OrganisationSchema = new mongoose.Schema(
  {
    companyNameGe: {
      type: String,
      required: true,
      trim: true,
    },
    companyNameEn: {
      type: String,
      required: true,
      trim: true,
    },
    identificationCode: {
      type: String,
      required: true,
      unique: true,
      minlength: 9,
      maxlength: 9,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      enum: ["tbilisi", "batumi", "kutaisi", "rustavi", "gori", "zugdidi"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  { timestamps: true },
);

const Organisation = mongoose.model("Organisation", OrganisationSchema);
export default Organisation;
