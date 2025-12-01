'use client';

import { useParams } from 'next/navigation';

export const CollectionList = () => {
  const params = useParams();
  const id = params.id;
  return <>ID: {id}</>;
};
