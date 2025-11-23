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
import { useState, useTransition } from 'react';

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

interface AttachmentProps {
  id: string;
  label: string;
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
  const collectionProgress = (raised / goal) * 100;

  const [isEditingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  const [isEditingDescription, setEditingDescription] = useState(false);
  const [draftDescription, setDraftDescription] = useState(description);

  const [isPending, startTransition] = useTransition();

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

  return (
    <Card>
      {/* Cover image */}
      <Box position="relative">
        {coverImage && (<CardMedia component="img" height="260" image={coverImage} alt="cover" />)}
        {editable && (
          <IconButton
            onClick={changeCollectionCover}
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
        )}
      </Box>
      <CardContent>
        {/* Title */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {!isEditingTitle ? (
            <>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {title}
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
          {!isEditingDescription && <Typography mt={1}>{description}</Typography>}

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
                onDelete={editable ? deleteAttachment : undefined}
                onClick={downloadAttachment}
              />
            ))}
            {editable && <Chip icon={<AddIcon />} label="Dodaj" onClick={uploadAttachment} />}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};
