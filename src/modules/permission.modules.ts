import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "General",
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", PermissionSchema);
export default Permission;
