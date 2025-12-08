'use client';

import React, { useState } from 'react';
import {
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { createCollection } from './actions';
import { useRouter } from 'next/navigation'; // Zmiana: import useRouter zamiast redirect

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflowY: 'auto',
};

interface CreateCollectionButtonProps {
  classId: string;
}

export default function CreateCollectionButton({ classId }: CreateCollectionButtonProps) {
  const router = useRouter(); // Inicjalizacja routera
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amountPerChild: '',
    endDate: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      title: '',
      description: '',
      amountPerChild: '',
      endDate: '',
    });
    setCoverImage(null);
    setPreviewUrl('');
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Walidacja podstawowa
    if (!formData.title || !formData.amountPerChild || !formData.endDate) {
      setError('Wypełnij wszystkie wymagane pola');
      setLoading(false);
      return;
    }

    // Walidacja kwoty
    const amount = parseFloat(formData.amountPerChild);
    if (isNaN(amount) || amount <= 0) {
      setError('Kwota musi być większa od 0');
      setLoading(false);
      return;
    }

    // Walidacja daty
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate < today) {
      setError('Data zakończenia nie może być w przeszłości');
      setLoading(false);
      return;
    }

    try {
      // Przygotowanie FormData
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amountPerChild', formData.amountPerChild);
      formDataToSend.append('endDate', formData.endDate);
      formDataToSend.append('classId', classId);

      if (coverImage) {
        formDataToSend.append('coverImage', coverImage);
      }

      // Wywołanie akcji serwerowej
      const result = await createCollection(formDataToSend);

      if (result.success) {
        // Sukces - zamknij modal i przekieruj do nowej zbiórki
        handleClose();
        // Przekierowanie do strony zbiórki
        router.push(`/collection/${result.collectionId}`);
      } else {
        setError(result.error || 'Wystąpił nieznany błąd');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas przetwarzania żądania');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <>
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ mb: 3 }}>
        Nowa zbiórka
      </Button>

      <Modal open={open} onClose={handleClose} aria-labelledby="create-collection-modal">
        <Box sx={modalStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h2">
              Nowa zbiórka
            </Typography>
            <IconButton onClick={handleClose} disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Tytuł zbiórki *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                fullWidth
                disabled={loading}
              />

              <TextField
                label="Opis zbiórki"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                disabled={loading}
              />

              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Zdjęcie okładki
                </Typography>
                <Button variant="outlined" component="label" fullWidth disabled={loading}>
                  Wybierz zdjęcie
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </Button>
                {previewUrl && (
                  <Box mt={2}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Podgląd"
                      style={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                    />
                  </Box>
                )}
              </Box>

              <TextField
                label="Kwota na dziecko *"
                name="amountPerChild"
                value={formData.amountPerChild}
                onChange={handleChange}
                required
                type="number"
                inputProps={{ step: '0.01', min: '0.01' }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">zł</InputAdornment>,
                }}
                fullWidth
                placeholder="50.00"
                disabled={loading}
              />

              <TextField
                label="Data zakończenia zbiórki *"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: getTomorrowDate(),
                }}
                disabled={loading}
              />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={handleClose} disabled={loading}>
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    loading || !formData.title || !formData.amountPerChild || !formData.endDate
                  }
                >
                  {loading ? <CircularProgress size={24} /> : 'Stwórz zbiórkę'}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Modal>
    </>
  );
}
