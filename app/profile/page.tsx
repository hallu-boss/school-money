import { auth } from '@/lib/auth';
import { Container, Paper, Stack, Typography } from '@mui/material';
import { redirect } from 'next/navigation';
import { SignOut } from '../components/SignOut';
import { UserInformation } from './user/UserInformation';
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

      <Paper sx={{ bgcolor: 'grey.100', p: 2, textAlign: 'center' }}>
        <Stack spacing={4}>
          <UserInformation user={session.user} />
          <ChildSection childrenList={children} />
          <Typography variant="body1" color="text.secondary">
            Signed in as:
          </Typography>
          <Typography variant="subtitle1" fontWeight={500}>
            {session.user?.email ?? 'Unknown user'}
          </Typography>
          <SignOut />
        </Stack>
      </Paper>
    </Container>
  );
}
