import { destroySession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request:Request){
  await destroySession();
  return NextResponse.redirect(new URL('/login',request.url),303);
}

export async function GET(request:Request){
  return NextResponse.redirect(new URL('/admin',request.url));
}
