import { ContentCopy, PersonAdd } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { School } from '@prisma/client';
import { useEffect, useState } from 'react';
import { createClass, getSchools } from './actions/actions';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type CreateClassProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export const CreateClassDialog = ({ open, onClose, onCreated }: CreateClassProps) => {
  const router = useRouter();

  const [selectedSchool, setSelectedSchool] = useState('');
  const [className, setClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [openCopyCodeAlert, setOpenCopyCodeAlert] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [classImage, setClassImage] = useState<string | null>(null);

  useEffect(() => {
    getSchools().then(setSchools).catch(console.error);
  }, []);

  const handleClose = () => {
    setSelectedSchool('');
    setClassName('');
    setJoinCode('');
    setClassImage('');
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setClassImage(reader.result as string); // base64 image
      };
      reader.readAsDataURL(file);
    }
  };

  // nazwa klasy będzie miała wielkie litery w celu łatwiejszej weryfikacji
  const handleClassNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().trim();

    setClassName(value);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(joinCode);
    setOpenCopyCodeAlert(true);
  };

  //TODO: error niech się jakoś wyświetla może jako powiadomienie albo coś nie wiem
  const handleSave = async () => {
    try {
      if (!selectedSchool) {
        return;
      }

      if (!className || className.length < 2) {
        return;
      }

      if (!joinCode || joinCode.length !== 13) {
        return;
      }

      const formData = new FormData();

      formData.append('schoolId', selectedSchool);
      formData.append('className', className);
      formData.append('joinCode', joinCode);

      if (classImage) {
        formData.append('classImage', classImage);
      }

      const result = await createClass(formData);

      if (!result.success) {
        console.error(result.message);
        return;
      }

      handleClose();
      router.refresh();
    } catch (error) {
      console.error('Błąd przy zapisie klasy: ', error);
    }
    onCreated?.();
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
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('class-image-input')?.click()}
                >
                  {classImage ? (
                    <Image
                      src={classImage}
                      alt="Class"
                      width={128}
                      height={128}
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <PersonAdd sx={{ fontSize: 48, color: 'text.secondary' }} />
                  )}
                </Box>
                <input
                  type="file"
                  id="class-image-input"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </Box>

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
              <FormControl fullWidth variant="outlined">
                <InputLabel id="school-select-label">Wybierz szkołę</InputLabel>
                <Select
                  labelId="school-select-label"
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  label="Wybierz szkołę"
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Wybierz szkołę
                  </MenuItem>
                  {schools.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Class Selection */}
            <Box>
              <Typography variant="body1" fontWeight="500" gutterBottom>
                Klasa dziecka
              </Typography>
              <TextField
                label="Nazwa klasy"
                placeholder="Np. 1A, 2B"
                fullWidth
                value={className}
                onChange={handleClassNameChange}
                sx={{ mt: 2 }}
              />
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
