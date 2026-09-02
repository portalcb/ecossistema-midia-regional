import postgres from 'postgres';

let client: ReturnType<typeof postgres> | null = null;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL não configurada');
  if (!client) client = postgres(url, { max: 5, idle_timeout: 20 });
  return client;
}

export const sql = db();

export type TenantContext={organizationId:string;profileId:string;role:string};
export async function withTenant<T>(ctx:TenantContext,fn:(tx:any)=>Promise<T>){
  if(!ctx.organizationId||!ctx.profileId||!ctx.role)throw new Error('Contexto de tenant inválido');
  return db().begin(async tx=>{
    await tx`select set_config('app.organization_id',${ctx.organizationId},true),set_config('app.profile_id',${ctx.profileId},true),set_config('app.role',${ctx.role},true)`;
    return fn(tx);
  });
}
