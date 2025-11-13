import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';

type JoinClassDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const JoinClassDialog = ({ open, onClose }: JoinClassDialogProps) => {
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setClassCode('');
      setError('');
    }
  }, [open]);

  //sprawdzanie czy kod ma wymagane 13 znaków
  const validateClassCode = (value: string) => {
    if (value.length !== 13) {
      setError('Kod musi mieć 13 znaków');
      return false;
    }
  };

  const handleClassCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (validateClassCode(value)) {
      setClassCode(value);
    }
  };

  const handleSubmit = () => {
    if (!validateClassCode(classCode)) {
      return;
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2,
        }}
      >
        <Typography variant="h5" fontWeight="600">
          Dołącz do klasy
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          <Box>
            <TextField
              sx={{ mt: 2 }}
              label="Kod klasy"
              placeholder="Wpisz kod..."
              fullWidth
              variant="outlined"
              value={classCode}
              onChange={handleClassCodeChange}
              error={!!error}
              helperText={error}
            />
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={onClose} color="inherit">
              Anuluj
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Dołącz
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
