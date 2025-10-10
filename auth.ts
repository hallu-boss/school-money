import NextAuth from 'next-auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  // TODO: add prisma adapter
  providers: [],
});
