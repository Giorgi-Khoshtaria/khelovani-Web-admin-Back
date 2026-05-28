import type { Request } from "express";
import AdminAuditLog from "../../modules/adminAuditLog.modules.js";

export const logAdminAction = (
  req: Request,
  action: string,
  targetModel: string,
  targetId?: string,
  meta?: Record<string, unknown>,
): void => {
  const user = req.user as any;
  if (!user?.id) return;

  // Fire-and-forget — audit logging must never block the response
  AdminAuditLog.create({
    adminId: user.id,
    adminEmail: user.email ?? "unknown",
    action,
    targetModel,
    ...(targetId ? { targetId } : {}),
    meta: meta ?? {},
  }).catch((err: Error) => {
    console.error("[audit] failed to write log:", err.message);
  });
};
