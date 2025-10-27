'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { User } from '@auth/core/types';
import { updateUserProfile } from './actions';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type UserWithIban = User & {
  iban?: string | null;
};

type EditProfileDialogProps = {
  open: boolean;
  onClose: () => void;
  user: UserWithIban;
};

export const EditProfileDialog = ({ open, onClose, user }: EditProfileDialogProps) => {
  const router = useRouter();

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatarPreview, setAvatarPreview] = useState(user.image || '');
  const [file, setFile] = useState<File | null>(null);
  const [iban, setIban] = useState(user.iban || '');

  const resetForm = () => {
    setName('');
    setEmail('');
    setFile(null);
    setAvatarPreview('');
    setNameError('');
    setIban('');
  };

  // Stany błędów
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [ibanError, setIbanError] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newFile = acceptedFiles[0];
      setFile(newFile);
      setAvatarPreview(URL.createObjectURL(newFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  // Handler dla zmiany imienia
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value.trim() !== (user?.name || '')) {
      validateName(value);
    } else {
      setNameError('');
    }
  };

  // Handler dla zmiany numeru konta
  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIban(value);
    if (value.trim() !== (user?.iban || '')) {
      validateIban(value);
    } else {
      setIbanError('');
    }
  };

  // Sprawdzanie czy są jakieś zmiany
  const hasChanges = useMemo(() => {
    const hasNameChange = name.trim() !== (user?.name || '');
    const hasEmailChange = email.trim() !== (user?.email || '');
    const hasFileChange = file !== null;
    const hasIbanChange = iban.trim() !== (user?.iban || '');
    return hasNameChange || hasEmailChange || hasFileChange || hasIbanChange;
  }, [name, user?.name, user?.email, user?.iban, email, file, iban]);

  // Sprawdzanie czy formularz jest poprawny
  const isFormValid = useMemo(() => {
    if (!hasChanges) return false;

    // Jeśli imię się zmieniło, musi być poprawne
    if (name.trim() !== (user?.name || '')) {
      if (name.trim().length < 2) return false;
    }

    // Jeśli email się zmienił, musi być poprawny
    if (email.trim() !== (user?.email || '')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) return false;
    }

    if (iban.trim() !== (user?.iban || '')) {
      if (!/^\d{26}$/.test(iban.trim())) return false;
    }

    return true;
  }, [hasChanges, name, user?.name, user?.email, user?.iban, email, iban]);

  // Handler dla zmiany emaila
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.trim() !== (user?.email || '')) {
      validateEmail(value);
    } else {
      setEmailError('');
    }
  };

  //Walidacja imienia
  const validateName = (value: string): boolean => {
    if (value.trim().length === 0) {
      setNameError('Imie nie może być puste');
      return false;
    }

    if (value.trim().length < 2) {
      setNameError('Imie musi mieć przynajmniej dwa znaki');
      return false;
    }
    setNameError('');
    return true;
  };

  //walidacja numeru konta
  const validateIban = (value: string): boolean => {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      setIbanError('Numer konta nie może być pusty');
      return false;
    }

    if (!/^\d+$/.test(trimmed)) {
      setIbanError('Numer konta może zawierać tylko cyfry');
      return false;
    }

    if (trimmed.length !== 26) {
      setIbanError('Numer konta musi mieć dokładnie 26 cyfr');
      return false;
    }

    setIbanError('');
    return true;
  };
  //walidacja email
  const validateEmail = (value: string): boolean => {
    if (value.trim().length === 0) {
      setEmailError('Email nie może być pusty');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      setEmailError('Nieprawidłowy format email');
      return false;
    }
    setEmailError('');
    return true;
  };
  const handleSave = async () => {
    if (!hasChanges) {
      console.log('Brak zmian do zapisania');
      onClose();
      return;
    }

    try {
      const formData = new FormData();

      if (name.trim() !== (user?.name || '')) {
        formData.append('name', name.trim());
      }
      if (email.trim() !== (user?.email || '')) {
        formData.append('email', email.trim());
      }
      if (file) {
        formData.append('file', file);
      }
      if (iban.trim() !== (user?.iban || '')) {
        formData.append('iban', iban.trim());
      }
      if (iban.trim() !== (user?.iban || '')) {
        if (!/^\d{26}$/.test(iban.trim())) return false;
      }
      const result = await updateUserProfile(formData);

      if (!result.success) {
        console.error(result.message);
        return;
      }

      handleClose();
      router.refresh();
    } catch (error) {
      console.error('Błąd przy zapisie profilu:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1, minWidth: 350 }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Edytuj profil
        </Typography>
        <TextField
          label="Imię"
          value={name}
          onChange={handleNameChange}
          error={!!nameError}
          helperText={nameError || 'Minimum 2 znaki'}
          required
        />
        <TextField
          label="Email"
          value={email}
          onChange={handleEmailChange}
          error={!!emailError}
          helperText={emailError || 'Podaj poprawny adres email'}
          type="email"
          required
        />
        <TextField
          label="Numer konta"
          value={iban}
          onChange={handleIbanChange}
          error={!!ibanError}
          helperText={ibanError || 'Podaj poprawny numer konta'}
          required
        />
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed grey',
            borderRadius: 2,
            p: 2,
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <Typography>Upuść plik tutaj ...</Typography>
          ) : (
            <Typography>Przeciągnij i upuść avatar lub kliknij, aby wybrać</Typography>
          )}
        </Box>

        {avatarPreview && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Avatar
              src={avatarPreview}
              sx={{ width: 100, height: 100, border: '1px solid grey' }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button variant="contained" onClick={handleSave} disabled={!isFormValid}>
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};
