import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logger";

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Sends a successful API response
 */
export function sendSuccess<T>(data: T, meta?: unknown, status: number = 200) {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };
  if (meta !== undefined) {
    body.meta = meta;
  }
  return NextResponse.json(body, { status });
}

/**
 * Sends an error API response
 */
export function sendError(
  message: string,
  code: string = "INTERNAL_SERVER_ERROR",
  status: number = 500,
  details?: unknown
) {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
  return NextResponse.json(body, { status });
}

/**
 * Global handler for route catch blocks to format errors into standard responses
 */
export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    logger.warn(`API Error [${error.errorCode}]: ${error.message}`, {
      details: error.details,
    });
    return sendError(error.message, error.errorCode, error.statusCode, error.details);
  }

  logger.error("Unhandled API Exception", error);
  
  // Clean up message for production
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : error instanceof Error
      ? error.message
      : "Internal Server Error";

  return sendError(message, "INTERNAL_SERVER_ERROR", 500);
}
