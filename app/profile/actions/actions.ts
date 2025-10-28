'use server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { mkdir, stat, unlink, writeFile } from 'fs/promises';
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

  // Przygotowanie danych
  if (name && typeof name === 'string') {
    updateData.name = name.trim();
  }

  if (email && typeof email === 'string') {
    updateData.email = email.trim();
  }

  if (iban && typeof iban === 'string') {
    updateData.iban = iban.trim();
  }

  // Upload avatara jeśli jest plik
  if (file && file.size > 0) {
    const userDir = path.join(process.cwd(), 'public', 'uploads', 'users', session.user.id);
    await mkdir(userDir, { recursive: true });

    const filePath = path.join(userDir, 'avatar.jpg');

    // Usuń stary avatar
    try {
      await stat(filePath);
      await unlink(filePath);
    } catch {}

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    updateData.image = `/uploads/users/${session.user.id}/avatar.jpg`;
  }

  // Jeśli nie ma żadnych zmian
  if (Object.keys(updateData).length === 0) {
    return {
      success: false,
      message: 'Brak danych do aktualizacji',
    };
  }

  // Aktualizuj użytkownika
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
      userId: session.user.id,
    },
  });

  if (file && file.size > 0) {
    const userDir = path.join(process.cwd(), 'public', 'uploads', 'children', child.id);
    await mkdir(userDir, { recursive: true });

    const filePath = path.join(userDir, `avatar.jpg`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const avatarUrl = `/uploads/children/${child.id}/avatar.jpg`;

    await db.child.update({
      where: { id: child.id },
      data: { avatarUrl },
    });
  } else {
    const avatarUrl = '/uploads/default/avatar.jpg';
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
    where: { userId: session.user.id },
    include: {
      membership: {
        include: {
          class: { include: { School: true } },
        },
      },
      Payment: true,
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

    const filePath = path.join(userDir, 'avatar.jpg');

    // Usuń stary avatar
    try {
      await stat(filePath);
      await unlink(filePath);
    } catch {}

    const bytes = await avatar.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    updateData.avatarUrl = `/uploads/children/${childId}/avatar.jpg`;
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

export async function abortChild(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  //TODO: trzeba chyba usuwać kaskadowo przez milion relacji
}
