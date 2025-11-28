import { auth } from '@/lib/auth';
import { Container, Paper, Stack, Typography } from '@mui/material';
import { redirect } from 'next/navigation';
import { UserInformation } from './user/UserInformation';
import { ChildSection } from './child/ChildSection';
import { returnProperUser } from './actions/actions';
import Navbar from '../components/Navbar';

export default async function Home() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  console.log(session.user);

  const user = await returnProperUser(session.user?.id);
  const plainUser = user ? JSON.parse(JSON.stringify(user)) : null;
  return (
    <>
      <Navbar></Navbar>
      <Container sx={{ mt: 8 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Mój profil
        </Typography>

        <Paper sx={{ bgcolor: 'grey.100', p: 2, textAlign: 'center' }}>
          <Stack spacing={4}>
            <UserInformation user={plainUser} />
            <ChildSection />
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
