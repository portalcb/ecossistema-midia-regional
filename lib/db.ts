import postgres from 'postgres';
import { AsyncLocalStorage } from 'node:async_hooks';

let client: ReturnType<typeof postgres> | null = null;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  if (!client) client = postgres(url, { max: 5, idle_timeout: 20 });
  return client;
}

// Keep the shared tagged-template client lazy. Creating it at module load time
// makes `next build` require DATABASE_URL while Next.js is only collecting
// route metadata, before any database-backed request is executed.
export type TenantContext={organizationId:string;profileId:string;role:string};
const tenantContext=new AsyncLocalStorage<TenantContext>();

export function bindTenantContext(ctx:TenantContext){
  if(!ctx.organizationId||!ctx.profileId||!ctx.role)throw new Error('Contexto de tenant inválido');
  tenantContext.enterWith(ctx);
}

export const sql = (async(strings: TemplateStringsArray, ...values: unknown[])=>{
  const ctx=tenantContext.getStore();
  if(!ctx)throw new Error('Consulta sem contexto de tenant');
  return db().begin(async tx=>{
    await tx`select set_config('app.organization_id',${ctx.organizationId},true),set_config('app.profile_id',${ctx.profileId},true),set_config('app.role',${ctx.role},true)`;
    await tx`set local role authenticated`;
    return (tx as any)(strings,...values);
  });
}) as unknown as ReturnType<typeof postgres>;

export async function withTenant<T>(ctx:TenantContext,fn:(tx:any)=>Promise<T>){
  if(!ctx.organizationId||!ctx.profileId||!ctx.role)throw new Error('Contexto de tenant inválido');
  return db().begin(async tx=>{
    await tx`select set_config('app.organization_id',${ctx.organizationId},true),set_config('app.profile_id',${ctx.profileId},true),set_config('app.role',${ctx.role},true)`;
    await tx`set local role authenticated`;
    return fn(tx);
  });
}
