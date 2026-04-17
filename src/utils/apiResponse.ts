import { Response } from "express";

export interface ResponseMeta {
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  [key: string]: any;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
  meta?: ResponseMeta,
) => {
  const response: any = {
    success: statusCode >= 200 && statusCode < 300,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (meta !== undefined) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
};

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getCloudinaryPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^./]+)?$/);
  return match ? match[1] : null;
}
