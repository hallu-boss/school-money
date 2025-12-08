import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();
  if (!session || !session.user) redirect('/sign-in');
  redirect('/profile');
}
