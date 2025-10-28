import { auth } from '@/lib/auth';
import { Container, Paper, Typography } from '@mui/material';
import { redirect } from 'next/navigation';
import { SignOut } from '../components/SignOut';
import { UserInformation } from './user/UserInformation';
import { ChildCard } from './child/ChildCard';
import { Box } from '@mui/material';
import { getUserChildren } from './actions/actions';
import { ChildSection } from './child/ChildSection';

export default async function Home() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  console.log(session.user);

  const children = await getUserChildren();

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Mój profil
      </Typography>

      <Paper
        sx={{
          bgcolor: 'grey.100',
          p: 2,
          textAlign: 'center',
        }}
      >
        {/* sekcja usera */}
        <UserInformation user={session.user} />

        {/* sekcja dzieci */}
        <ChildSection childrenList={children} />

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
