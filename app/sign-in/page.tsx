

import React from 'react'
import { signIn } from '@/lib/auth'
import Link from 'next/link'
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Link as MuiLink,
} from '@mui/material'

async function handleLogin(formData: FormData) {
  'use server'
  try {
    const result = await signIn('credentials', formData)
    console.log('signIn result', result)
  } catch (err) {
    console.error('signIn error', err)
  }
}

export default function LoginPage() {
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
            Sign In
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
            Sign in
          </Button>

          <Typography align="center" variant="body2">
            Don&apos;t have an account?{' '}
            <MuiLink component={Link} href="/sign-up" underline="hover">
              Sign up
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}
