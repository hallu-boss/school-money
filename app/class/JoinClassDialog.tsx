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

type JoinClassDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const JoinClassDialog = ({ open, onClose }: JoinClassDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
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
            />
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={onClose} color="inherit">
              Anuluj
            </Button>
            <Button variant="contained" color="primary">
              Dołącz
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
