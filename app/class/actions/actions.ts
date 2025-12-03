'use server';

import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { ClassMembershipRole } from '@prisma/client';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

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
  const classCode = payload.get('joinCode') as string | null;
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

    //TODO: Odkomentować w momencie gdy Paweł Majster doda avatarUrl do bazy
    // const classAvatarUrl = `/uploads/classes/${newClass.id}/${fileName}`;
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
    const allChildren = m.class.memberships.flatMap((mem) =>
      mem.children.map((child) => ({
        ...child,
        isOwnChild: mem.userId === session.user?.id, // Sprawdzamy czy to dziecko należy do zalogowanego użytkownika
      })),
    );

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

export const assignChildToClass = async (childId: string, classId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const membership = await db.classMembership.findFirst({
    where: {
      classId: classId,
      userId: session.user.id,
    },
  });

  if (!membership) {
    throw new Error('Membership not found');
  }

  await db.child.update({
    where: { id: childId },
    data: { membershipId: membership.id },
  });

  return { success: true, message: 'Dziecko przypisane do klasy' };
};

export async function getUserChildren() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const children = await db.child.findMany({
    where: { parentId: session.user.id },
    select: {
      id: true,
      name: true,
    },
  });

  return children;
}

export const joinClass = async (classCode: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  if (!classCode || classCode.length !== 13) {
    return { succes: false, message: 'Kod niepoprawny albo nie znaleziono odpowiedniej klasy' };
  }

  // bo nie może być po prostu class
  const klass = await db.class.findUnique({
    where: { accessCode: classCode },
  });

  if (!klass) {
    return { succes: false, message: 'Kod nieporawny albo nie znaleziono odpowiedniej klasy' };
  }

  if (klass.isArchived) {
    return { succes: false, message: 'Klasa została już zarchiwizowana' };
  }

  // istotne bo trzeba sprawdzić czy użytkownik już nie należy do tej klasy
  const membership = await db.classMembership.findFirst({
    where: {
      classId: klass?.id,
      userId: session.user.id,
    },
  });

  if (membership) {
    return { succes: false, message: 'Już należysz do tej klasy' };
  }

  await db.classMembership.create({
    data: {
      classId: klass.id,
      userId: session.user.id,
      userRole: ClassMembershipRole.PARENT,
    },
  });

  return { succes: true, message: 'Pomyślnie dołączono do klasy' };
};

//TODO: w przypadku co z usuwaniem trzeba uwzględnić jakieś płatności czy inne gunwa
export const leaveClass = async (classId: string) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await db.classMembership.deleteMany({
    where: {
      userId: session.user.id,
      classId: classId,
    },
  });

  return { succes: true, message: 'Pomyślnie odszedłeś z klasy' };
};

export const getUserSchoolsAndClasses = async () => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const memberships = await db.classMembership.findMany({
    where: { userId: session.user.id },
    include: { class: { include: { School: true } } },
  });

  const schoolMap: Record<
    string,
    { id: string; name: string; classes: { id: string; name: string }[] }
  > = {};

  memberships.forEach((m) => {
    const school = m.class.School;
    if (!school) return;
    if (!schoolMap[school.id]) {
      schoolMap[school.id] = { id: school.id, name: school.name, classes: [] };
    }
    if (!schoolMap[school.id].classes.find((c) => c.id === m.class.id)) {
      schoolMap[school.id].classes.push({ id: m.class.id, name: m.class.name });
    }
  });

  return Object.values(schoolMap);
};

export const removeChildFromClass = async (childId: string, classId: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const membership = await db.classMembership.findFirst({
    where: {
      userId: session.user.id,
      classId: classId,
    },
    include: {
      children: true,
    },
  });

  if (!membership) {
    throw new Error('Nie masz dostępu do tej klasy');
  }

  const hasChild = membership.children.some((child) => child.id === childId);
  if (!hasChild) {
    throw new Error('To nie jest Twoje dziecko');
  }

  await db.classMembership.update({
    where: { id: membership.id },
    data: {
      children: {
        disconnect: { id: childId },
      },
    },
  });

  return { succes: true, message: 'Pomyślnie wypisano dziecko z klasy' };
};

//-----------------------------------------------------------------
export const getClassCollections = async (classId: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const collections = await db.collection.findMany({
    where: { classId },
  });

  return collections.map((c) => ({
    ...c,
    amountPerChild: c.amountPerChild.toNumber(),
  }));
};

export const getClassName = async (classId: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const cls = await db.class.findFirst({
    where: { id: classId },
  });

  return cls?.name || null;
};

//-----------------------------------------------------------------
