import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    category: {
      type: String,
      required: false,
      trim: true,
      default: "General",
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model("Permission", PermissionSchema);
export default Permission;
