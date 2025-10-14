import { auth } from '@/lib/auth';
import { Container, Paper, Typography } from '@mui/material';
import { redirect } from 'next/navigation';
import { SignOut } from './components/SignOut';


export default async function Home() {
  const session = await auth();
  if (!session)
    redirect('/sign-in');
  return (
     <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
      >
        SchoolMoney Project – HOME page
      </Typography>

      <Paper
        sx={{
          bgcolor: 'grey.100',
          p: 2,
          textAlign: 'center',
        }}
      >
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
