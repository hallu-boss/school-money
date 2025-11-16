import { ClassMembershipRole, PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function clearDB() {
  await prisma.withdrawal.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.collectionAccount.deleteMany();
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
let ibanSuffix = 0;

async function createMockUser(name: string, email: string, image: string | null = null) {
  ibanSuffix += 1;
  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      image,
      iban: `PL60102010260000010203045${ibanSuffix.toString().padStart(2, '0')}`,
    },
  });
}

async function createMockChild(name: string, parentId: string, avatarUrl: string | null = null) {
  await prisma.child.create({
    data: {
      name,
      userId: parentId,
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

async function createMockClass(
  name: string,
  schoolId: string,
  createdById: string,
  accessCode: string = 'AAAAAAAAAA',
) {
  const cl = await prisma.class.create({
    data: {
      name,
      createdById,
      schoolId,
      accessCode,
    },
  });
  await prisma.classMembership.create({
    data: {
      classId: cl.id,
      userId: createdById,
      userRole: ClassMembershipRole.TREASURER,
    },
  });
}

async function main() {
  console.log('Czyszczenie istniejących danych...');
  await clearDB();

  console.log('Tworzenie użytkowników...');
  const kowal = await createMockUser('Jan Kowalski', 'jan.kowalski@example.com');
  const nowak = await createMockUser('Anna Nowak', 'anna.nowak@example.com');
  const wisnia = await createMockUser('Piotr Wiśniewski', 'piotr.wisniewski@example.com');
  const lewy = await createMockUser('Maria Lewandowska', 'maria.lewandowska@example.com');
  const wojcik = await createMockUser('Krzysztof Wójcik', 'krzysztof.wojcik@example.com');

  console.log('Tworzenie dzieci...');
  await createMockChild('Kasia Kowalska', kowal.id);
  await createMockChild('Michał Nowak', nowak.id);
  await createMockChild('Zuzia Wiśniewska', wisnia.id);
  await createMockChild('Aleksander Lewandowski', lewy.id);
  await createMockChild('Julia Wójcik', wojcik.id);

  console.log('Tworzenie szkół...');
  const school1 = await createMockSchool(
    'Szkoła Podstawowa nr 1 im. Marii Skłodowskiej-Curie w Warszawie',
  );
  await createMockSchool('Szkoła Podstawowa nr 24 z Oddziałami Integracyjnymi w Krakowie');
  await createMockSchool('Szkoła Podstawowa nr 5 im. Henryka Sienkiewicza w Poznaniu');
  await createMockSchool('Szkoła Podstawowa nr 12 z Oddziałami Sportowymi we Wrocławiu');
  await createMockSchool('Szkoła Podstawowa nr 8 im. Jana Pawła II w Gdańsku');

  console.log('Tworzenie klas...');
  await createMockClass('IA', school1.id, kowal.id);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
