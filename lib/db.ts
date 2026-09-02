import postgres from 'postgres';

let client: ReturnType<typeof postgres> | null = null;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  if (!client) client = postgres(url, { max: 5, idle_timeout: 20 });
  return client;
}

// Alias do cliente para uso como tagged template: sql`select ... ${valor}`.
// O tipo é preservado diretamente da biblioteca postgres.
export const sql = db();
