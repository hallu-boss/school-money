import { auth } from '@/lib/auth';
import { Container, Paper, Typography } from '@mui/material';
import { redirect } from 'next/navigation';
import { SignOut } from '../components/SignOut';
import { UserInformation } from './UserInformation';
import { Child } from '@prisma/client';
import { ChildCard } from './ChildCard';
import { Box } from '@mui/material';

export default async function Home() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  console.log(session.user);

  const childrenList: Child[] = [
    {
      id: '2342as',
      name: 'Johan Muller',
      avatarUrl:
        'https://www.humanium.org/en/wp-content/uploads/2025/05/shutterstock_2267902633-1024x683.jpg',
      userId: '1',
      createdAt: new Date(),
    },
    {
      id: '23427d5',
      name: 'Elie Muller',
      avatarUrl:
        'http://ocdn.eu/pulscms-transforms/1/A2rk9kpTURBXy85NWNlYmQwNTY3NTZjYjZkMWJmY2Q5ZGIyOWFjMjUzMS5qcGeSlQMCzQEXzQu3zQaYkwXNBLDNAqTeAAGhMAE',
      userId: '1',
      createdAt: new Date(),
    },
  ];

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        SchoolMoney Project – HOME page
      </Typography>

      <Paper
        sx={{
          bgcolor: 'grey.100',
          p: 2,
          textAlign: 'center',
        }}
      >
        <UserInformation user={session.user} />
        <Typography variant="h3" fontWeight="bold" margin={2}>
          Twoje dzieci
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
          }}
        >
          {childrenList.map((user) => (
            <ChildCard key={user.id.replace(/\D/g, '')} user={user} />
          ))}
        </Box>

        <Typography variant="body1" color="text.secondary">
          Signed in as:
        </Typography>

        <Typography variant="subtitle1" fontWeight={500}>
          {session.user?.email ?? 'Unknown user'}
        </Typography>

        <SignOut />
      </Paper>
    </Container>
  );
}
