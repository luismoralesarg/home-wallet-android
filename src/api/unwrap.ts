/** Error de la API con el `code` del schema `{code, message}`. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

function toError(error: unknown, response: Response): ApiError {
  const e = error as { code?: string; message?: string } | undefined;
  return new ApiError(e?.message ?? `Error ${response.status}`, e?.code, response.status);
}

/** Convierte la respuesta de openapi-fetch en datos o en un ApiError con el mensaje de la API. */
export function unwrap<T>(res: { data?: T; error?: unknown; response: Response }): T {
  if (res.error !== undefined || res.data === undefined) throw toError(res.error, res.response);
  return res.data;
}

/** Igual que unwrap pero para respuestas sin cuerpo (204). */
export function unwrapEmpty(res: { error?: unknown; response: Response }): void {
  if (res.error !== undefined) throw toError(res.error, res.response);
}
