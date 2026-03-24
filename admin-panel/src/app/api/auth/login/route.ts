import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  // Demo: Accept any email/password for now
  if (!email || !password) {
    return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
  }
  // In production, validate user from DB
  const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
  return NextResponse.json({ token });
}
