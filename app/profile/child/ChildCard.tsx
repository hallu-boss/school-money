'use client';

import {
  Avatar,
  Box,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Prisma } from '@prisma/client';
import { Card, CardActionArea, CardContent } from '@mui/material';
import React, { useState } from 'react';
import { EditChildDialog } from './EditChildDialog';

export type ChildWithRelations = Prisma.ChildGetPayload<{
  include: {
    membership: { include: { class: { include: { School: true } } } };
    Payment: true;
  };
}>;

type ChildCardProps = {
  child?: ChildWithRelations;
};

const ChildCard = ({ child }: ChildCardProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const handleOpen = () => {
    setMode('view');
    setOpen(true);
  };
  const handleEdit = () => setMode('edit');
  const handleClose = () => setOpen(false);

  if (!child) {
    return (
      <Paper sx={{ bgcolor: 'grey.80', p: 2, textAlign: 'center' }}>
        Brak informacji o użytkowniku
      </Paper>
    );
  }

  const childClassName = child.membership?.class?.name ?? 'Brak klasy';
  const schoolName = child.membership?.class?.School?.name ?? 'Brak szkoły';
  const childAvatar = child.avatarUrl;
  const childName = child.name;

  const basicInformation = () => {
    return (
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box>
          <Avatar
            src={childAvatar || undefined}
            alt={childName || 'Użytkownik'}
            sx={{
              width: 120,
              height: 120,
              fontSize: 50,
              bgcolor: 'primary.main',
            }}
          />
        </Box>
        <Box textAlign={'left'}>
          <Typography variant="h3">{child.name}</Typography>
          Klasa: {childClassName}
          <Typography variant="h3" color="#01579b"></Typography>
          Szkoła: {schoolName}
        </Box>
      </Stack>
    );
  };

  return (
    <>
      <Card
        elevation={5}
        sx={{
          borderRadius: 5,
          bgcolor: 'grey.80',
          m: 2,
        }}
      >
        <CardActionArea onClick={handleOpen}>
          <CardContent>{basicInformation()}</CardContent>
        </CardActionArea>
      </Card>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{mode === 'view' ? basicInformation() : 'Edytuj dziecko'}</DialogTitle>

        <DialogContent dividers>
          {mode === 'view' ? (
            <Typography margin={2} variant="body1">
              <b>Tutaj będą dane</b>
            </Typography>
          ) : (
            <EditChildDialog child={child} onClose={handleClose} open={false} />
          )}
        </DialogContent>

        <DialogActions>
          {mode === 'view' ? (
            <>
              <Button onClick={handleClose}>Zamknij</Button>
              <Button onClick={handleEdit}>Edytuj</Button>
            </>
          ) : (
            <Button onClick={handleClose}>Anuluj</Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export { ChildCard };
