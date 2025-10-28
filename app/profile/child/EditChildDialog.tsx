'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  TextField,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { Child } from '@prisma/client';
import { updateChild } from '../actions/actions';

type EditChildDialogProps = {
  open: boolean;
  onClose: () => void;
  child: Child;
  onUpdateChild?: () => void;
};

export const EditChildDialog = ({ open, onClose, child, onUpdateChild }: EditChildDialogProps) => {
  const [name, setName] = useState(child.name || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(child.avatarUrl);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  // Resetowanie formularza przy zmianie dziecka
  useEffect(() => {
    setName(child.name || '');
    setPreview(child.avatarUrl || null);
    setAvatar(null);
    setNameError('');
  }, [child]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  // Walidacja imienia
  const validateName = (value: string): boolean => {
    if (value.trim().length < 2) {
      setNameError('Imię musi mieć przynajmniej 2 znaki');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value.trim() !== child.name) {
      validateName(value);
    } else {
      setNameError('');
    }
  };

  // Sprawdzanie, czy coś się zmieniło
  const hasChanges = useMemo(() => {
    return name.trim() !== (child.name || '') || avatar !== null;
  }, [name, avatar, child.name]);

  const isFormValid = useMemo(() => {
    return hasChanges && validateName(name);
  }, [hasChanges, name]);

  const handleSave = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      const formData = new FormData();
      if (name.trim() !== child.name) formData.append('name', name.trim());
      if (avatar) formData.append('avatar', avatar);

      await updateChild(child.id, formData);
      onUpdateChild?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edytuj dane dziecka</DialogTitle>
      <DialogContent dividers>
        <Box
          {...getRootProps()}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            py: 2,
          }}
        >
          <input {...getInputProps()} />
          <Avatar
            src={preview ?? undefined}
            alt={name}
            sx={{ width: 120, height: 120, fontSize: 50, bgcolor: 'primary.main' }}
          />
          <Typography variant="body2" color="text.secondary">
            {isDragActive ? 'Upuść tutaj zdjęcie' : 'Kliknij lub przeciągnij, aby zmienić zdjęcie'}
          </Typography>
        </Box>

        <TextField
          label="Imię dziecka"
          fullWidth
          margin="normal"
          value={name}
          onChange={handleNameChange}
          error={!!nameError}
          helperText={nameError || 'Minimum 2 znaki'}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anuluj
        </Button>
        <Button onClick={handleSave} disabled={!isFormValid || loading}>
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};
