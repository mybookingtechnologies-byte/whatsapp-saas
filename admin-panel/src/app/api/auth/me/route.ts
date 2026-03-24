import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, SECRET);
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}
