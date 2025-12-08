import { auth } from '@/lib/auth';
import Navbar from '../components/Navbar';
import { getBalance } from '../actions';
import { redirect } from 'next/navigation';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !session?.user?.id) redirect('/sign-in');
  return (
    <>
      <Navbar balance={await getBalance(session.user.id)} />
      {children}
    </>
  );
}
