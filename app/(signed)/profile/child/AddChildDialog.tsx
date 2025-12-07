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
import { addChild } from '../actions/actions';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type AddChildDialogProps = {
  open: boolean;
  onClose: () => void;
  onChildAdded?: () => void;
};

export const AddChildDialog = ({ open, onClose, onChildAdded }: AddChildDialogProps) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const resetForm = () => {
    setName('');
    setFile(null);
    setAvatarPreview('');
    setNameError('');
  };

  // Stany błędów
  const [nameError, setNameError] = useState('');

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
    if (value.trim() !== '') {
      validateName(value);
    } else {
      setNameError('');
    }
  };

  // Sprawdzanie czy są jakieś zmiany
  const hasChanges = useMemo(() => {
    const hasNameChange = name.trim() !== '';
    const hasFileChange = file !== null;
    return hasNameChange || hasFileChange;
  }, [name, file]);

  // Sprawdzanie czy formularz jest poprawny
  const isFormValid = useMemo(() => {
    if (!hasChanges) return false;

    // Jeśli imię się zmieniło, musi być poprawne
    if (name.trim() !== '') {
      if (name.trim().length < 2) return false;
    }

    return true;
  }, [name, hasChanges]);

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

  const handleSave = async () => {
    if (!hasChanges) {
      console.log('Brak zmian do zapisania');
      onClose();
      return;
    }

    try {
      const formData = new FormData();

      if (name.trim() !== '') {
        formData.append('name', name.trim());
      }

      if (file) {
        formData.append('file', file);
      }

      const result = await addChild(formData);

      if (!result.success) {
        console.error(result.message);
        return;
      }

      resetForm();
      onChildAdded?.();
      onClose();

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
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 350 }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Dodaj dziecko
        </Typography>
        <TextField
          label="Imię dziecka"
          onChange={handleNameChange}
          error={!!nameError}
          helperText={nameError || 'Minimum 2 znaki'}
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
