import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.school.createMany({
    data: [
      { name: 'Szkoła Podstawowa nr 1 im. Mikołaja Kopernika Warszawa' },
      { name: 'Szkoła Podstawowa nr 2 im. Jana Pawła II Kraków' },
      { name: 'Gimnazjum nr 1 im. Adama Mickiewicza Poznań' },
      { name: 'Liceum Ogólnokształcące nr 1 im. Marii Skłodowskiej-Curie Gdańsk' },
      { name: 'Szkoła Muzyczna nr 1 im. Fryderyka Chopina Wrocław' },
      { name: 'Szkoła Podstawowa nr 3 Przymierza Rodzin im. bł. ks. Jerzego Popiełuszki Warszawa' },
      { name: 'Gimnazjum nr 2 im. Juliusza Słowackiego Łódź' },
      { name: 'Liceum Ogólnokształcące nr 2 im. Ignacego Krasickiego Poznań' },
    ],
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
