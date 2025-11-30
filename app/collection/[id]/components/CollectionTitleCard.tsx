'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import {
  changeCollectionCover,
  deleteAttachment,
  downloadAttachment,
  updateCollectionDescription,
  updateCollectionTitle,
  uploadAttachment,
} from '../actions/actions';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export interface AttachmentProps {
  id: string;
  label: string;
}

interface CollectionTitleCardProps {
  coverImage: string | null;
  title: string;
  start: string;
  end: string;
  raised: number;
  goal: number;
  description: string;
  attachments: AttachmentProps[];
  editable: boolean;
}

export const CollectionTitleCard = ({
  coverImage,
  title,
  start,
  end,
  raised,
  goal,
  description,
  attachments,
  editable,
}: CollectionTitleCardProps) => {
  const router = useRouter();

  const collectionProgress = (raised / goal) * 100;

  const [isEditingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  const [isEditingDescription, setEditingDescription] = useState(false);
  const [draftDescription, setDraftDescription] = useState(description);

  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const saveTitle = () => {
    startTransition(async () => {
      await updateCollectionTitle(draftTitle);
      setEditingTitle(false);
    });
  };

  const cancelTitle = () => {
    setDraftTitle(title);
    setEditingTitle(false);
  };

  const saveDescription = () => {
    startTransition(async () => {
      await updateCollectionDescription(draftDescription);
      setEditingDescription(false);
    });
  };

  const cancelDescription = () => {
    setDraftDescription(description);
    setEditingDescription(false);
  };

  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      startTransition(async () => {
        await changeCollectionCover(file);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        router.refresh();
      });
    }
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      startTransition(async () => {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          await uploadAttachment(file);
        }
        if (attachmentInputRef.current) {
          attachmentInputRef.current.value = '';
        }
        router.refresh();
      });
    }
  };

  const handleAttachmentDelete = (attachmentId: string) => {
    startTransition(async () => {
      await deleteAttachment(attachmentId);
      router.refresh();
    });
  };

  const handleAttachmentDownload = async (attachmentId: string) => {
    try {
      const result = await downloadAttachment(attachmentId);
      
      if (result) {
        // Konwersja base64 na blob
        const byteCharacters = atob(result.fileBuffer);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: result.mimeType });
        
        // Tworzenie linku do pobrania
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
      alert('Wystąpił błąd podczas pobierania pliku');
    }
  };

  return (
    <Card>
      {/* Cover image */}
      <Box position="relative">
        {coverImage && <CardMedia component="img" height="260" image={coverImage} alt="cover" />}
        {editable && (
          <>
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255,255,255,0.8)',
                '&:hover': { bgcolor: 'white' },
              }}
            >
              <EditIcon />
            </IconButton>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCoverImageChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </>
        )}
      </Box>
      <CardContent>
        {/* Title */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {!isEditingTitle ? (
            <>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {draftTitle}
              </Typography>
              {editable && (
                <IconButton size="small" onClick={() => setEditingTitle(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </>
          ) : (
            <Box width="100%">
              <TextField
                fullWidth
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                variant="outlined"
                size="small"
              />
              <Stack direction="row" spacing={1} mt={1}>
                <Button
                  variant="contained"
                  startIcon={<CheckIcon />}
                  disabled={isPending}
                  onClick={saveTitle}
                >
                  Zapisz
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={cancelTitle}
                  disabled={isPending}
                >
                  Anuluj
                </Button>
              </Stack>
            </Box>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Rozpoczęto: {start}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Zakończy się: {end}
        </Typography>

        {/* Progress */}
        <Box mt={2}>
          <Typography variant="body1" gutterBottom>
            Zebrano {raised} / {goal} zł
          </Typography>
          <LinearProgress variant="determinate" value={collectionProgress} />
        </Box>

        {/* Description */}
        <Box mt={3}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6">Opis</Typography>

            {editable && !isEditingDescription && (
              <IconButton size="small" onClick={() => setEditingDescription(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          {/* VIEW MODE */}
          {!isEditingDescription && <Typography mt={1}>{draftDescription}</Typography>}

          {/* EDIT MODE */}
          {isEditingDescription && (
            <Box mt={2}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
              />

              <Stack direction="row" spacing={2} mt={2}>
                <Button
                  variant="contained"
                  startIcon={<CheckIcon />}
                  disabled={isPending}
                  onClick={saveDescription}
                >
                  Zapisz
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={cancelDescription}
                  disabled={isPending}
                >
                  Anuluj
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        {/* Attachments */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Załączniki
          </Typography>
          <Stack direction="row" spacing={1}>
            {attachments.map((a) => (
              <Chip
                key={a.id}
                label={a.label}
                onDelete={editable ? () => handleAttachmentDelete(a.id) : undefined}
                onClick={() => handleAttachmentDownload(a.id)}
              />
            ))}
            {editable && (
              <>
                <Chip
                  icon={<AddIcon />}
                  label="Dodaj"
                  onClick={() => attachmentInputRef.current?.click()}
                />
                <input
                  type="file"
                  ref={attachmentInputRef}
                  onChange={handleAttachmentChange}
                  multiple // Umożliwia wybór wielu plików
                  style={{ display: 'none' }}
                />
              </>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};
