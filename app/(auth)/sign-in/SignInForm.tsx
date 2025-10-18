'use client';
import { Box, Typography, TextField, LinearProgress, Button, Link } from '@mui/material';
import React, { useState, useTransition } from 'react';
import { handleLogin } from './actions';
import { LoginData, schema } from '@/lib/schema';

export default function SignInForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<keyof LoginData, string>>>({});

  const handleAction = async (formData: FormData) => {
    const values = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof LoginData, string>> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as keyof LoginData;
        fieldErrors[fieldName] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      await handleLogin(formData);
    });
  };

  return (
    <Box display="flex" component="form" action={handleAction} flexDirection="column" gap={3}>
      <Typography variant="h5" align="center">
        Sign In
      </Typography>

      <TextField
        label="Email"
        type="email"
        name="email"
        fullWidth
        spellCheck={false}
        error={Boolean(errors.email)}
        helperText={errors.email}
      />
      <TextField
        label="Password"
        type="password"
        name="password"
        fullWidth
        spellCheck={false}
        error={Boolean(errors.password)}
        helperText={errors.password}
      />

      {isPending ? (
        <LinearProgress />
      ) : (
        <Button variant="contained" type="submit" fullWidth>
          Sign in
        </Button>
      )}

      <Typography align="center" variant="body2">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" underline="hover">
          Sign up
        </Link>
      </Typography>
    </Box>
  );
}
