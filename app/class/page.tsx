import { redirect } from 'next/navigation';
import Navbar from '../components/Navbar';
import { auth } from '@/lib/auth';
import { ClassList } from './ClassList';

export default async function Home() {
  const session = await auth();
  if (!session) redirect('/sign-in');
  console.log(session.user);

  return (
    <>
      <Navbar></Navbar>
      <ClassList></ClassList>
    </>
  );
}
