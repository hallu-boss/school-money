

import React from 'react'
import { auth } from '@/lib/auth'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material'
import { redirect } from 'next/navigation'
import { signUp } from '@/lib/actions'

async function handleLogin(formData: FormData) {
  'use server'
  const res = await signUp(formData);
  if (res.success) redirect('/sign-in');
}

export default async function Page() {
  const session = await auth();
  if (session) redirect('/');

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Box
          display="flex"
          component="form"
          action={handleLogin}
          flexDirection="column"
          gap={3}
        >
          <Typography variant="h5" align="center">
            Sign Up
          </Typography>

          <TextField
            label="Email"
            type="email"
            name="email"
            fullWidth
            spellCheck={false}
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            fullWidth
            spellCheck={false}
          />

          <Button variant="contained" type="submit" fullWidth>
            Sign up
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
