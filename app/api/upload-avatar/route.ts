import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat, unlink } from 'fs/promises';
import path from 'path';
import db from '@/lib/db';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const userDir = path.join(process.cwd(), 'public', 'uploads', 'users', session.user.id);
  await mkdir(userDir, { recursive: true });

  const filePath = path.join(userDir, 'avatar.jpg');

  // Remove old avatar
  try {
    await stat(filePath);
    await unlink(filePath);
  } catch {}

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  const fileUri = `/uploads/users/${session.user.id}/avatar.jpg`;

  await db.user.update({
    where: { id: session.user.id },
    data: { image: fileUri },
  });

  return NextResponse.json({ success: true, fileUri });
}
