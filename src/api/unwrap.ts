/** Convierte la respuesta de openapi-fetch en datos o en un Error con el mensaje de la API. */
export function unwrap<T>(res: { data?: T; error?: unknown; response: Response }): T {
  if (res.error !== undefined || res.data === undefined) {
    const err = res.error as { message?: string } | undefined;
    throw new Error(err?.message ?? `Error ${res.response.status}`);
  }
  return res.data;
}

/** Igual que unwrap pero para respuestas sin cuerpo (204). */
export function unwrapEmpty(res: { error?: unknown; response: Response }): void {
  if (res.error !== undefined) {
    const err = res.error as { message?: string };
    throw new Error(err?.message ?? `Error ${res.response.status}`);
  }
}
