import { ContentCopy, PersonAdd } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type CreateClassProps = {
  open: boolean;
  onClose: () => void;
};

export const CreateClassDialog = ({ open, onClose }: CreateClassProps) => {
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [openCopyCodeAlert, setOpenCopyCodeAlert] = useState(false);

  const handleClose = () => {
    onClose();
  };

  //TODO: sprawdzanie czy wygenerowany kod jest unikalny
  const generateCode = () => {
    const length = 13;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    setJoinCode(
      Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    );
  };

  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setOpenCopyCodeAlert(true);
  };

  const handleSave = () => {
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
        <Typography variant="h5" component="div" fontWeight="600">
          Utwórz klasę
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Sidebar */}
          <Box
            sx={{
              width: { xs: '100%', md: 256 },
              p: 3,
              borderRight: { md: 1 },
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    width: 128,
                    height: 128,
                    borderRadius: '50%',
                    bgcolor: 'action.selected',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 4,
                    borderColor: 'primary.light',
                  }}
                >
                  <PersonAdd sx={{ fontSize: 48, color: 'text.secondary' }} />
                </Box>
              </Box>

              <Typography variant="subtitle1" fontWeight="600" textAlign="center">
                Zdjęcie klasy
              </Typography>

              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', mt: 2 }}
              >
                <Button variant="outlined" fullWidth onClick={handleSave}>
                  Zapisz
                </Button>
                <Button variant="text" fullWidth onClick={handleClose}>
                  Anuluj
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Right Content */}
          <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* School Search */}
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Wyszukaj szkołę
              </Typography>
              <TextField
                fullWidth
                placeholder="Wyszukaj szkołę dziecka"
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
              />
            </Box>

            {/* Class Selection */}
            <Box>
              <Typography variant="body1" fontWeight="500" gutterBottom>
                Klasa dziecka
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  displayEmpty
                >
                  {/* to będzie do wywalenia */}
                  <MenuItem value="" disabled>
                    Wybierz klasę
                  </MenuItem>
                  <MenuItem value="1a">1A</MenuItem>
                  <MenuItem value="1b">1B</MenuItem>
                  <MenuItem value="2a">2A</MenuItem>
                  <MenuItem value="2b">2B</MenuItem>
                  <MenuItem value="3a">3A</MenuItem>
                  <MenuItem value="3b">3B</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Join Code Section */}
            <Box sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body1" fontWeight="500" gutterBottom>
                Tworzenie kodu dołączenia do klasy
              </Typography>

              <Box
                sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}
              >
                <Button variant="contained" onClick={generateCode} sx={{ whiteSpace: 'nowrap' }}>
                  Generuj
                </Button>

                {joinCode && (
                  <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
                    <Box
                      sx={{
                        flex: 1,
                        px: 2,
                        py: 1,
                        bgcolor: 'primary.light',
                        border: 2,
                        borderColor: 'primary.main',
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.dark',
                      }}
                    >
                      {joinCode}
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={copyCode}
                      startIcon={<ContentCopy />}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Kopiuj
                    </Button>
                    <Snackbar
                      open={openCopyCodeAlert}
                      autoHideDuration={3000}
                      onClose={() => setOpenCopyCodeAlert(false)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                      <Alert
                        onClose={() => setOpenCopyCodeAlert(false)}
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                      >
                        Kod został skopiowany do schowka!
                      </Alert>
                    </Snackbar>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
