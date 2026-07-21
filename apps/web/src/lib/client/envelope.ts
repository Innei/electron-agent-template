import type { TransportEnvelope } from "../../../../../packages/core/src/contract/index.js";
import { ApiError } from "../api";

export function unwrapEnvelope<T>(
  envelope: TransportEnvelope<T>,
  status: number,
): { data: T; meta?: Record<string, unknown> } {
  if (!envelope.ok) {
    throw new ApiError(envelope.hint ? `${envelope.error} (${envelope.hint})` : envelope.error, status, envelope.code);
  }
  return { data: envelope.data, meta: envelope.meta };
}
