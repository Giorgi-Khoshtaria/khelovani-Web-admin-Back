import mongoose from "mongoose";

const AdminAuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, required: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetModel: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

// Auto-delete after 90 days
AdminAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AdminAuditLog = mongoose.model("AdminAuditLog", AdminAuditLogSchema);
export default AdminAuditLog;
