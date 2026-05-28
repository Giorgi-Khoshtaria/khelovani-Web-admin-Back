import mongoose from "mongoose";

const RequestLogSchema = new mongoose.Schema(
  {
    method: { type: String, required: true, index: true },
    url: { type: String, required: true },
    statusCode: { type: Number, required: true, index: true },
    responseTimeMs: { type: Number, required: true },
    source: {
      type: String,
      enum: ["user", "partner", "admin", "public"],
      required: true,
      index: true,
    },
    ip: { type: String },
    userAgent: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    userRole: { type: String, default: null },
    errorMessage: { type: String, default: null },
    errorStack: { type: String, default: null },
    requestBody: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

// TTL: auto-delete after 3 days (259200 seconds)
RequestLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });
RequestLogSchema.index({ createdAt: -1, statusCode: 1 });
RequestLogSchema.index({ source: 1, createdAt: -1 });

const RequestLog = mongoose.model("RequestLog", RequestLogSchema);
export default RequestLog;
