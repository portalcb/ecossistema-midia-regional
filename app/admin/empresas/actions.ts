'use server';
import {redirect} from 'next/navigation';
import {requireSession} from '@/lib/auth';
import {sql} from '@/lib/db';
export async function createCompany(formData:FormData){const u=await requireSession();const name=String(formData.get('name')||'').trim();if(!name)throw new Error('Nome obrigatório');const type=String(formData.get('company_type')||'prospect');if(!['prospect','client','partner','advertiser','sponsor'].includes(type))throw new Error('Tipo inválido');const email=String(formData.get('email')||'').trim()||null;const phone=String(formData.get('phone')||'').trim()||null;const city=String(formData.get('city')||'').trim()||null;const state=String(formData.get('state')||'').trim().toUpperCase()||null;await sql`insert into crm_companies(organization_id,name,company_type,email,phone,city,state,created_by) values(${u.organizationId},${name},${type},${email},${phone},${city},${state},${u.id})`;redirect('/admin/empresas')}
