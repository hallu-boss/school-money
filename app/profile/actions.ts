'use server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { mkdir, stat, unlink, writeFile } from 'fs/promises';
import path from 'path';

//TODO: zmiana nazwy funkcji
/**
 * @param formData
 * @returns Promise<void>
 * To jest api do uploadowania avatarów użytkownika
 */

export const updateUser = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized????');
  }

  const file = formData.get('file') as File;

  if (!file) {
    return { Success: false, Message: 'No file uploaded' };
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

  return { success: true, fileUri };
};
