import Navbar from '@/app/components/Navbar';
import { CollectionList } from './CollectionList';

export default async function Home() {
  return (
    <>
      <Navbar></Navbar>
      <CollectionList></CollectionList>
    </>
  );
}
