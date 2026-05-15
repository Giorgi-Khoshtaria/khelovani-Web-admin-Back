import mongoose from "mongoose";
import { PartnerStatusEnum } from "../types/partnerStatus.js";
import { PartnerTypeEnum } from "../types/partnerTypes.js";

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
    partnerType: {
      type: String,
      enum: Object.values(PartnerTypeEnum),
      default: PartnerTypeEnum.ORGANIZATION,
      required: true,
      index: true,
    },
    identificationCode: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    personalNumber: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    contactPerson: {
      type: String,
      required: false,
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
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    pinnedAt: {
      type: Date,
      default: null,
    },
    isShown: {
      type: Boolean,
      default: true,
      index: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    categories: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

const Organisation = mongoose.model("Organisation", OrganisationSchema);
export default Organisation;
