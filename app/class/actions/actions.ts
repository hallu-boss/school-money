'use server';

import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { ClassMembershipRole } from '@prisma/client';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

//TODO: pobieranie listy klas do których się należy
//TODO: Dołączanie do klasy z weryfikacją czy już się tam jest
//TODO: Skarnik ma możliwość edycji/usunięcia klasy z bazy
//TODO: Rodzic ma możliwość usunięcia dziecka z klasy (case: bękart jest przepisywany do innej klasy)
export const getSchools = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const data = await db.school.findMany({
    orderBy: { name: 'asc' },
  });

  return data;
};

export const createClass = async (payload: FormData) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const schoolId = payload.get('schoolId') as string | null;
  const file = payload.get('classImage') as File | null;
  const classCode = payload.get('clasCode') as string | null;
  const className = payload.get('className') as string;

  //TODO: Dodatkowa walidacja danych (nie za bardzo potrzebne ale może się coś sknocić)
  if (!schoolId || !schoolId.trim()) {
    throw new Error('SchoolId is required');
  }

  //sprawdzenie czy takie ID szkoły faktycznie istnieje
  const school = await db.school.findUnique({
    where: { id: schoolId },
  });

  if (!school) {
    throw new Error("This schoolId doesn't exist");
  }

  const newClass = await db.class.create({
    data: {
      schoolId: schoolId,
      accessCode: classCode,
      name: className,
      createdById: session.user.id,
    },
  });

  //TODO: Uzupełnić funkcję o dodawanie zdjęcia klasowego do bazy

  if (file && file.size > 0) {
    const classDir = path.join(process.cwd(), 'public', 'uploads', 'classes', newClass.id);
    await mkdir(classDir, { recursive: true });

    const timestamp = Date.now();
    const ext = path.extname(file.name) || '.jpg';
    const fileName = `classAvatar_${timestamp}${ext}`;
    const filePath = path.join(classDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const classAvatarUrl = `/uploads/classes/${newClass.id}/${fileName}`;

    //TODO: Odkomentować w momencie gdy Paweł Majster doda avatarUrl do bazy
    // await db.class.update({
    //   where: { id: newClass.id },
    //   data: { classAvatarUrl },
    // });
  }

  await db.classMembership.create({
    data: {
      classId: newClass.id,
      userId: session.user.id,
      userRole: ClassMembershipRole.TREASURER,
    },
  });

  console.log(payload);
  return { success: true, message: 'Successfully added class' };
};

export const getUserClasses = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const memberships = await db.classMembership.findMany({
    where: { userId: session.user.id },
    include: {
      class: {
        include: {
          School: true,
          memberships: {
            include: {
              children: true,
            },
          },
        },
      },
    },
  });

  const classes = memberships.map((m) => {
    const allChildren = m.class.memberships.flatMap((mem) => mem.children);
    return {
      ...m.class,
      userRole: m.userRole,
      children: allChildren,
    };
  });
  return classes;
};

export const removeClass = async (id: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // const membership = await db.classMembership.findUnique({
  //   where: { classId_userId: { classId, userId: session.user.id } },
  // });

  return { succes: true, message: 'Pomyślnie usunięto klasę' };
};

export const assignChildToClass = async (childId: string, schoolId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
};

export async function getUserChildren() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const children = await db.child.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
    },
  });

  return children;
}
