'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
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

type EditProfileDialogProps = {
  open: boolean;
  onClose: () => void;
  user: User;
};

export const EditProfileDialog = ({ open, onClose, user }: EditProfileDialogProps) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatarPreview, setAvatarPreview] = useState(user.image || '');
  const [file, setFile] = useState<File | null>(null);

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

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);

      if (file) {
        formData.append('file', file);
      }

      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Błąd przy zapisie profilu:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edytuj profil</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 350 }}
      >
        <TextField label="Imię" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

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
        <Button variant="contained" onClick={handleSave}>
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};
