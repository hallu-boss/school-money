'use server';

import { auth } from '@/lib/auth';
import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Decimal } from '@prisma/client/runtime/library';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { BankAccountType } from '@prisma/client';

function generateIban() {
  const rand = Math.random().toString().slice(2, 18);
  return `PL${rand.padStart(26, '0')}`;
}

export async function createCollection(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Musisz być zalogowany' };
  }

  const userId = session.user.id;

  // Pobierz dane z formularza
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const amountPerChild = formData.get('amountPerChild') as string;
  const endDate = formData.get('endDate') as string;
  const classId = formData.get('classId') as string;
  const file = formData.get('coverImage') as File;

  // Walidacja danych
  if (!title || !amountPerChild || !endDate || !classId) {
    return { success: false, error: 'Wypełnij wszystkie wymagane pola' };
  }

  try {
    // 1. Sprawdź czy użytkownik należy do klasy i ma uprawnienia
    const membership = await db.classMembership.findFirst({
      where: {
        classId: classId,
        userId: session.user.id,
        userRole: 'TREASURER',
      },
    });

    if (!membership) {
      return {
        success: false,
        error: 'Nie masz uprawnień do tworzenia zbiórek w tej klasie lub nie jesteś skarbnikiem',
      };
    }

    // 2. Utwórz nową zbiórkę i konto bankowe w JEDNEJ transakcji
    const result = await db.$transaction(async (tx) => {
      // 2.1. Najpierw utwórz zbiórkę BEZ bankAccountId
      const collection = await tx.collection.create({
        data: {
          title,
          description,
          amountPerChild: new Decimal(parseFloat(amountPerChild)),
          startAt: new Date(),
          endAt: new Date(endDate),
          state: 'ACTIVE',
          classId,
          authorId: userId,
          // NIE podajemy bankAccountId tutaj
        },
      });

      // 2.2. Następnie utwórz konto bankowe z collectionId
      const bankAccount = await tx.bankAccount.create({
        data: {
          type: BankAccountType.COLLECTION,
          iban: generateIban(),
          balance: new Decimal(0),
          collectionId: collection.id, // Teraz kolekcja już istnieje
        },
      });

      // 2.3. Zaktualizuj zbiórkę z bankAccountId
      const updatedCollection = await tx.collection.update({
        where: { id: collection.id },
        data: { bankAccountId: bankAccount.id },
      });

      // 2.4. Przetwarzanie zdjęcia okładki
      let coverUrl = null;
      if (file && file.size > 0) {
        const userDir = path.join(process.cwd(), 'public', 'uploads', 'collection', collection.id);
        await mkdir(userDir, { recursive: true });

        const timestamp = Date.now();
        const ext = path.extname(file.name) || '.jpg';
        const fileName = `cover_${timestamp}${ext}`;
        const filePath = path.join(userDir, fileName);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        coverUrl = `/uploads/collection/${collection.id}/${fileName}`;

        // Zaktualizuj zbiórkę z coverUrl
        await tx.collection.update({
          where: { id: collection.id },
          data: { coverUrl },
        });
      }

      // 2.5. Pobierz wszystkie dzieci w klasie i utwórz uczestników
      const classMemberships = await tx.classMembership.findMany({
        where: { classId },
        include: { children: true },
      });

      const allChildren = classMemberships.flatMap((membership) => membership.children);

      if (allChildren.length > 0) {
        await Promise.all(
          allChildren.map((child) =>
            tx.collectionParticipant.create({
              data: {
                childId: child.id,
                collectionId: collection.id,
                isActive: true,
                joinedAt: new Date(),
              },
            }),
          ),
        );
      }

      return {
        collection: { ...updatedCollection, coverUrl },
        participantsCount: allChildren.length,
      };
    });

    // 3. Revalidate i zwróć wynik
    revalidatePath(`/class/${classId}`);
    revalidatePath('/');

    return {
      success: true,
      collectionId: result.collection.id,
      participantsCount: result.participantsCount,
    };
  } catch (error) {
    console.error('Error creating collection:', error);

    // Bardziej szczegółowe komunikaty błędów
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return {
          success: false,
          error: 'Wystąpił problem z unikalnością (np. IBAN lub relacja bankAccount już istnieje)',
        };
      }
      if (error.message.includes('foreign key constraint')) {
        return {
          success: false,
          error: 'Nie znaleziono powiązanej encji (np. klasa nie istnieje)',
        };
      }
    }

    return {
      success: false,
      error: 'Wystąpił błąd podczas tworzenia zbiórki. Spróbuj ponownie.',
    };
  }
}
