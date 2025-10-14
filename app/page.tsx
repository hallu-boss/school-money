import { auth } from '@/lib/auth';
import { Container } from '@mui/material';
import { redirect } from 'next/navigation';


export default async function Home() {
  const session = await auth();
  if (!session)
    redirect('/sign-in');
  return (
    <Container>
      <h1>SchoolMoney Project - HOME page</h1>
    </Container>
  );
}
