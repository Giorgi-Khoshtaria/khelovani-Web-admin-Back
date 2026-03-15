import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ["admin", "user", "moderator", "organisation"],
    },
    allowedPanels: [
      {
        type: String,
        enum: ["web", "admin"],
      },
    ],
    permissions: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Role = mongoose.model("Role", RoleSchema);
export default Role;
