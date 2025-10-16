import { auth } from '@/lib/auth';
import { Container, Paper, Typography } from '@mui/material';
import { redirect } from 'next/navigation';
import { SignOut } from './components/SignOut';
import { UserInformation } from './components/profile/UserInformation';
import { Child } from '@prisma/client';
import { ChildCard } from './components/profile/ChildCard';

export default async function Home() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  console.log(session.user);

  const dziecko1: Child = {
    id: '2342sd',
    name: 'Johan Muller',
    avatarUrl:
      'https://www.humanium.org/en/wp-content/uploads/2025/05/shutterstock_2267902633-1024x683.jpg',
    userId: '1',
    createdAt: new Date(),
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
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
        <ChildCard user={dziecko1} />

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
