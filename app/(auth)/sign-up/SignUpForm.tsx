'use client';
import { RegisterData, registerSchema } from '@/lib/schema';
import { Box, Typography, TextField, Button, LinearProgress } from '@mui/material';
import { useState, useTransition } from 'react';
import { signUp } from './actions';
import { redirect } from 'next/navigation';

export default function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});

  const handleAction = async (formData: FormData) => {
    const values = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof RegisterData, string>> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0] as keyof RegisterData;
        fieldErrors[fieldName] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      const res = await signUp(formData);
      if (res.success) redirect('/sign-in');
    });
  };

  return (
    <Box display="flex" component="form" action={handleAction} flexDirection="column" gap={3}>
      <Typography variant="h5" align="center">
        Sign Up
      </Typography>

      <TextField
        label="Name"
        name="name"
        fullWidth
        spellCheck={false}
        error={Boolean(errors.name)}
        helperText={errors.name}
      />

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
          Sign up
        </Button>
      )}
    </Box>
  );
}
