'use client';

import { useState, useCallback, useMemo } from 'react';
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
import { useRouter } from 'next/navigation';
import { updateChild } from '../actions/actions';

type EditChildDialogProps = {
  open: boolean;
  onClose: () => void;
  child: Child;
};

export const EditChildDialog = ({ open, onClose, child }: EditChildDialogProps) => {
  const router = useRouter();
  const [name, setName] = useState(child.name || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(child.avatarUrl);
  const [loading, setLoading] = useState(false);

  // dropzone do zmiany zdjęcia
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      if (avatar) formData.append('avatar', avatar);

      await updateChild(child.id, formData);
      router.refresh();
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
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Anuluj
        </Button>
        <Button onClick={handleSave} disabled={loading || !name}>
          Zapisz
        </Button>
      </DialogActions>
    </Dialog>
  );
};
