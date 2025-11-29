/* eslint-disable @typescript-eslint/no-unused-vars */
import { BankAccountType, ClassMembershipRole, PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function clearDB() {
  await prisma.payment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.collectionParticipant.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.child.deleteMany();
  await prisma.classMembership.deleteMany();
  await prisma.class.deleteMany();
  await prisma.school.deleteMany();
  await prisma.authenticator.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
}

const hashedPassword = await argon2.hash('password123');

export async function createBankAccountForUser(
  userId: string,
  balance = 0,
  iban?: string,
) {
  const bankAccount = await prisma.bankAccount.create({
    data: {
      type: BankAccountType.USER,
      iban: iban ?? generateIban(),
      balance,
      userId,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { bankAccountId: bankAccount.id }
  })

  return bankAccount;
}

export async function createBankAccountForCollection(
  collectionId: string,
  balance = 0,
  iban?: string,
) {
  const bankAccount = await prisma.bankAccount.create({
    data: {
      type: BankAccountType.COLLECTION,
      iban: iban ?? generateIban(),
      balance,
      collectionId,
    },
  });

  await prisma.collection.update({
    where: { id: collectionId },
    data: { bankAccountId: bankAccount.id }
  })

  return bankAccount;
}

function generateIban() {
  const rand = Math.random().toString().slice(2, 18); // losowy 16-cyfrowy fragment
  return `PL${rand.padStart(26, "0")}`;
}

async function createMockUser(name: string, email: string, image: string | null = null) {
  
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      image,
    },
  });

  await createBankAccountForUser(user.id);

  return user;
}

async function createMockChild(name: string, parentId: string, avatarUrl: string | null = null) {
  return await prisma.child.create({
    data: {
      name,
      parentId: parentId,
      avatarUrl,
    },
  });
}

async function createMockSchool(name: string) {
  return await prisma.school.create({
    data: {
      name,
    },
  });
}

async function createMockClassWithMembers(
  name: string,
  schoolId: string,
  createdById: string,
  users: { userId: string; children: { id: string }[] }[],
  accessCode: string = 'AAAAAAAAAA',
) {
  // Utwórz klasę
  const cl = await prisma.class.create({
    data: {
      name,
      createdById,
      schoolId,
      accessCode,
    },
  });

  // Skarbnik klasy
  const treasurerMembership = await prisma.classMembership.create({
    data: {
      classId: cl.id,
      userId: createdById,
      userRole: ClassMembershipRole.TREASURER,
    },
  });

  // Dodaj dzieci skarbnika
  const treasurerEntry = users.find((u) => u.userId === createdById);
  if (treasurerEntry) {
    for (const child of treasurerEntry.children) {
      await prisma.child.update({
        where: { id: child.id },
        data: { membershipId: treasurerMembership.id },
      });
    }
  }

  // Dodaj pozostałych userów jako PARENT
  for (const u of users) {
    if (u.userId === createdById) continue; // pomiń skarbnika

    const membership = await prisma.classMembership.create({
      data: {
        classId: cl.id,
        userId: u.userId,
        userRole: ClassMembershipRole.PARENT,
      },
    });

    for (const child of u.children) {
      await prisma.child.update({
        where: { id: child.id },
        data: { membershipId: membership.id },
      });
    }
  }

  return cl;
}

async function createMockCollection(
  title: string,
  classId: string,
  authorId: string,
  amountPerChild: number,
  coverUrl?: string | null,
  description?: string | null,
) {
  const collection = await prisma.collection.create({
    data: {
      title,
      description,
      coverUrl,
      startAt: new Date(), // start teraz
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dni
      classId,
      authorId,
      amountPerChild,
    },
  });

  await createBankAccountForCollection(collection.id);

  const children = await prisma.child.findMany({
    where: { membership: { classId } },
  });

  await Promise.all(
    children.map((child) =>
      prisma.collectionParticipant.create({
        data: {
          childId: child.id,
          collectionId: collection.id,
        },
      }),
    ),
  );

  return collection;
}

async function main() {
  console.log('Czyszczenie istniejących danych...');
  await clearDB();

  console.log('Tworzenie użytkowników...');
  const u_jan_kowalski      = await createMockUser('Jan Kowalski', 'jan.kowalski@example.com');
  const u_anna_nowak        = await createMockUser('Anna Nowak', 'anna.nowak@example.com');
  const u_piotr_wisniewski  = await createMockUser('Piotr Wiśniewski', 'piotr.wisniewski@example.com');
  const u_maria_lewandowska = await createMockUser('Maria Lewandowska', 'maria.lewandowska@example.com');
  const u_krzysztof_wojcik  = await createMockUser('Krzysztof Wójcik', 'krzysztof.wojcik@example.com');

  console.log('Tworzenie dzieci...');
  const d_kasia_kowalska         = await createMockChild('Kasia Kowalska', u_jan_kowalski.id);
  const d_michal_nowak           = await createMockChild('Michał Nowak', u_anna_nowak.id);
  const d_zuzia_wisniewska       = await createMockChild('Zuzia Wiśniewska', u_piotr_wisniewski.id);
  const d_aleksander_lewandowski = await createMockChild( 'Aleksander Lewandowski', u_maria_lewandowska.id, );
  const d_julia_wójcik           = await createMockChild('Julia Wójcik', u_krzysztof_wojcik.id);

  console.log('Tworzenie szkół...');
  const school_p_nr1  = await createMockSchool( 'Szkoła Podstawowa nr 1 im. Marii Skłodowskiej-Curie w Warszawie', );
  const school_p_nr24 = await createMockSchool('Szkoła Podstawowa nr 24 z Oddziałami Integracyjnymi w Krakowie');
  const school_p_nr5  = await createMockSchool('Szkoła Podstawowa nr 5 im. Henryka Sienkiewicza w Poznaniu');
  const school_p_nr12 = await createMockSchool('Szkoła Podstawowa nr 12 z Oddziałami Sportowymi we Wrocławiu');
  const school_p_nr8  = await createMockSchool('Szkoła Podstawowa nr 8 im. Jana Pawła II w Gdańsku');

  console.log('Tworzenie klasy IA i dodawanie wszystkich userów + dzieci...');

  const class_p_nr1_IA = await createMockClassWithMembers(
    'IA', 
    school_p_nr1.id, 
    u_jan_kowalski.id, 
    [
      { userId: u_anna_nowak.id, children: [d_michal_nowak] },
      { userId: u_piotr_wisniewski.id, children: [d_zuzia_wisniewska] },
      { userId: u_maria_lewandowska.id, children: [d_aleksander_lewandowski] },
      { userId: u_krzysztof_wojcik.id, children: [d_julia_wójcik] },
      { userId: u_jan_kowalski.id, children: [d_kasia_kowalska] },
    ]
);

  console.log('Tworzenie przykładowej zbiórki...');
  await createMockCollection(
    'Składka na wycieczkę do Torunia',
    class_p_nr1_IA.id,
    u_jan_kowalski.id,
    50.0,
    'https://gfx.chillizet.pl/var/g3-chillizet-2/storage/images/podroze/torun-na-weekend-10-najwiekszych-atrakcji-tego-miasta/21993551-1-pol-PL/To-najstarsze-miasto-w-Polsce.-Stad-pochodzi-Tony-Halik-i-Zbigniew-Herbert_content.jpg',
    'Zbiórka na jednodniową wycieczkę klasową.',
  );
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
