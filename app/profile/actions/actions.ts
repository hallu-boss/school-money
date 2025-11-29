'use server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { mkdir, readdir, rm, unlink, writeFile } from 'fs/promises';
import path from 'path';

/**
 * @param formData
 * @returns Promise<void>
 * To jest api do uploadowania avatarów użytkownika
 */

export const returnProperUser = async (userId?: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  if (!userId) return null;

  const properUser = await db.user.findUnique({
    where: { id: userId },
    include: {
      bankAccount: true,
    },
  });

  return properUser;
};

export const updateUserProfile = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string | null;
  const email = formData.get('email') as string | null;
  const file = formData.get('file') as File | null;
  const iban = formData.get('iban') as string | null;

  const updateData: {
    name?: string;
    email?: string;
    image?: string;
    iban?: string;
  } = {};

  if (name && typeof name === 'string') updateData.name = name.trim();
  if (email && typeof email === 'string') updateData.email = email.trim();
  if (iban && typeof iban === 'string') updateData.iban = iban.trim();

  if (file && file.size > 0) {
    const userDir = path.join(process.cwd(), 'public', 'uploads', 'users', session.user.id);
    await mkdir(userDir, { recursive: true });

    // Usuń poprzedni avatar
    try {
      const files = await readdir(userDir);
      for (const f of files) {
        if (f.startsWith('avatar_')) {
          await unlink(path.join(userDir, f));
        }
      }
    } catch {
      // brak katalogu lub błędu — ignorujemy
    }

    const timestamp = Date.now();
    const ext = path.extname(file.name) || '.jpg';
    const fileName = `avatar_${timestamp}${ext}`;
    const filePath = path.join(userDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    updateData.image = `/uploads/users/${session.user.id}/${fileName}`;
  }

  if (Object.keys(updateData).length === 0) {
    return {
      success: false,
      message: 'Brak danych do aktualizacji',
    };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: updateData,
  });

  return {
    success: true,
    message: 'Profil zaktualizowany',
  };
};

export const addChild = async (formData: FormData) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const name = formData.get('name') as string | null;
  const file = formData.get('file') as File | null;

  if (!name || !name.trim()) throw new Error('Name is required');

  const child = await db.child.create({
    data: {
      name: name.trim(),
      parentId: session.user.id,
    },
  });

  if (file && file.size > 0) {
    const userDir = path.join(process.cwd(), 'public', 'uploads', 'children', child.id);
    await mkdir(userDir, { recursive: true });

    const timestamp = Date.now();
    const ext = path.extname(file.name) || '.jpg';
    const fileName = `avatar_${timestamp}${ext}`;
    const filePath = path.join(userDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const avatarUrl = `/uploads/children/${child.id}/${fileName}`;

    await db.child.update({
      where: { id: child.id },
      data: { avatarUrl },
    });
  }

  return { success: true, message: 'Dodano dziecko' };
};

export async function getUserChildren() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const children = await db.child.findMany({
    where: { parentId: session.user.id },
    include: {
      membership: {
        include: {
          class: { include: { School: true } },
        },
      },
      transactions: true,
    },
  });

  return children;
}

export async function updateChild(childId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string | null;
  const avatar = formData.get('avatar') as File | null;

  const updateData: {
    name?: string;
    avatarUrl?: string;
  } = {};

  if (name && typeof name === 'string') {
    updateData.name = name.trim();
  }

  if (avatar && avatar.size > 0) {
    const userDir = path.join(process.cwd(), 'public', 'uploads', 'children', childId);
    await mkdir(userDir, { recursive: true });

    // Usuń poprzedni plik
    try {
      const files = await readdir(userDir);
      for (const file of files) {
        if (file.startsWith('avatar_')) {
          await unlink(path.join(userDir, file));
        }
      }
    } catch {
      // katalog może być pusty
    }

    const timestamp = Date.now();
    const ext = path.extname(avatar.name) || '.jpg';
    const fileName = `avatar_${timestamp}${ext}`;
    const filePath = path.join(userDir, fileName);

    const bytes = await avatar.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    updateData.avatarUrl = `/uploads/children/${childId}/${fileName}`;
  }

  if (Object.keys(updateData).length === 0) {
    return {
      success: false,
      message: 'Brak danych do aktualizacji',
    };
  }

  await db.child.update({
    where: { id: childId },
    data: updateData,
  });

  return {
    success: true,
    message: 'Profil zaktualizowany',
  };
}

export async function abortChild(childId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const child = await db.child.findUnique({
    where: { id: childId },
    include: { transactions: true },
  });

  if (!child) {
    throw new Error('Child not found');
  }

  //sprawdzenie czy dzieciak należy do zalogowanego użytkownika
  if (child.parentId !== session.user.id) {
    throw new Error('Forbidden');
  }

  // jeśli dzieciak ma przypisane płątności - blokujemy usunięcie
  if (child.transactions.length > 0) {
    //TODO: Dodanie obsługi tych błędów do UI
    throw new Error('Cannot delete child with existing payments');
  }

  await db.child.delete({
    where: { id: childId },
  });

  const userDir = path.join(process.cwd(), 'public', 'uploads', 'children', childId);

  try {
    await rm(userDir, { recursive: true, force: true });
  } catch (err) {
    console.error('Błąd przy usuwaniu katalogu:', err);
  }

  return { success: true, message: 'Child deleted successfully' };
}
