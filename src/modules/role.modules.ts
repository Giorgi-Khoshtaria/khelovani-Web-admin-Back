import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    allowedPanels: [
      {
        type: String,
        enum: ["web", "admin", "admin-organization"],
      },
    ],
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
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
