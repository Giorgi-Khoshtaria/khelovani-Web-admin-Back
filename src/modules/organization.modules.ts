import mongoose from "mongoose";
import { PartnerStatusEnum } from "../types/partnerStatus.js";

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
    addressEn: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    descriptionEn: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },

    website: {
      type: String,
      required: false,
      trim: true,
    },
    facebook: {
      type: String,
      required: false,
      trim: true,
    },
    instagram: {
      type: String,
      required: false,
      trim: true,
    },
    tiktok: {
      type: String,
      required: false,
      trim: true,
    },
    category: {
      type: String,
      required: false,
      trim: true,
      enum: [
        "handcraft",
        "jewelry",
        "ceramics",
        "textile",
        "wood",
        "food",
        "art",
        "leather",
        "enamel",
      ],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: Object.values(PartnerStatusEnum),
      default: PartnerStatusEnum.PENDING,
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
