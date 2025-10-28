import { Child } from '@prisma/client';

export const childrenList: Child[] = [
  {
    id: '2342as',
    name: 'Johan Muller',
    avatarUrl:
      'https://www.humanium.org/en/wp-content/uploads/2025/05/shutterstock_2267902633-1024x683.jpg',
    userId: '1',
    createdAt: new Date(),
    membershipId: '',
  },
  {
    id: '23427d5',
    name: 'Elie Muller',
    avatarUrl:
      'http://ocdn.eu/pulscms-transforms/1/A2rk9kpTURBXy85NWNlYmQwNTY3NTZjYjZkMWJmY2Q5ZGIyOWFjMjUzMS5qcGeSlQMCzQEXzQu3zQaYkwXNBLDNAqTeAAGhMAE',
    userId: '1',
    createdAt: new Date(),
    membershipId: '',
  },
];
