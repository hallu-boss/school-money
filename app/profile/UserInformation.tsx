'use client';

import { useState } from 'react';
import { Avatar, Box, Paper, Typography, Stack, Button } from '@mui/material';
import { User } from '@auth/core/types';
import { EditProfileDialog } from './EditProfileDialog';
import { AddChildDialog } from './AddChildDialog';

import EditIcon from '@mui/icons-material/Edit';

type UserInformationProps = {
  user?: User;
  createdAt?: Date;
};

const UserInformation = ({ user }: UserInformationProps) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openAddChild, setOpenAddChild] = useState(false);

  if (!user) {
    return (
      <Paper sx={{ bgcolor: 'grey.80', p: 2, textAlign: 'center' }}>
        Brak informacji o użytkowniku
      </Paper>
    );
  }
  const userIban = user.iban ?? 'Nie podano numeru konta';
  return (
    <Paper
      sx={{
        display: 'flex',
        bgcolor: 'grey.80',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box>
          <Avatar
            src={user.image || undefined}
            alt={user.name || 'Użytkownik'}
            sx={{
              width: 150,
              height: 150,
              fontSize: 50,
              bgcolor: 'primary.main',
            }}
          />
          <Button
            variant="outlined"
            endIcon={<EditIcon />}
            sx={{ mt: 1 }}
            onClick={() => setOpenEdit(true)}
          >
            Edytuj dane
          </Button>
          <Button
            variant="outlined"
            endIcon={<EditIcon />}
            sx={{ mt: 1 }}
            onClick={() => setOpenAddChild(true)}
          >
            Dodaj dziecko
          </Button>
          <EditProfileDialog open={openEdit} onClose={() => setOpenEdit(false)} user={user} />
          <AddChildDialog open={openAddChild} onClose={() => setOpenAddChild(false)} />
        </Box>
        <Box textAlign={'left'}>
          <Typography variant="h6">Dane użytkownika:</Typography>
          <p>
            <b>{'Użytkownik: '}</b>
            {user.name}
          </p>
          <p>
            <b>{'Email: '}</b>
            {user.email}
          </p>
          <p>
            <b>{'Numer konta: '}</b>
            {userIban}
          </p>
        </Box>
      </Stack>
    </Paper>
  );
};

export { UserInformation };
