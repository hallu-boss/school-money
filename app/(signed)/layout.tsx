import { auth } from '@/lib/auth';
import Navbar from '../components/Navbar';
import { getBalance } from '../actions';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !session?.user?.id) throw new Error("Unauthorized");
  return (
      <>
        <Navbar balance={await getBalance(session.user.id)}/>
        {children}
      </>
  );
}
