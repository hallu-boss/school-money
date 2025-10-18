import React from 'react';
import { auth } from '@/lib/auth';
import { Container, Paper } from '@mui/material';
import { redirect } from 'next/navigation';
import SignInForm from './SignInForm';

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect('/');

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <SignInForm />
      </Paper>
    </Container>
  );
}
