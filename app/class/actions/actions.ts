'use server';

import { auth } from '@/lib/auth';
import db from '@/lib/db';

export const getSchools = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const data = await db.school.findMany({
    orderBy: { name: 'asc' },
  });

  return data;
};

export const createClass = async (payload: FormData) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  console.log(payload);
  return { success: true, message: 'Successfully added class' };
};
