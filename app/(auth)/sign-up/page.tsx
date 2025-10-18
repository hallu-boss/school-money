import React from 'react';
import { auth } from '@/lib/auth';
import { Container, Paper } from '@mui/material';
import { redirect } from 'next/navigation';
import SignUpForm from './SignUpForm';

export default async function Page() {
  const session = await auth();
  if (session) redirect('/');

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <SignUpForm />
      </Paper>
    </Container>
  );
}
