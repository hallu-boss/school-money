'use client';

import { Avatar, Box, Paper, Typography, Stack, Button } from '@mui/material';
import { User } from '@auth/core/types';

import EditIcon from '@mui/icons-material/Edit';

type UserInformationProps = {
  user?: User;
  createdAt?: Date;
};

const UserInformation = ({ user }: UserInformationProps) => {
  if (!user) {
    return (
      <Paper sx={{ bgcolor: 'grey.80', p: 2, textAlign: 'center' }}>
        Brak informacji o użytkowniku
      </Paper>
    );
  }

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
          {/** TODO: dodać reakcje */}
          <Button variant="outlined" endIcon={<EditIcon />}>
            Edytuj dane
          </Button>
        </Box>
        <Box textAlign={'left'}>
          <Typography variant="h6">Dane użytkownika</Typography>
          <p>
            <b>{'Użytkownik: '}</b>
            {user.name}
          </p>
          <p>
            <b>{'Email: '}</b>
            {user.email}
          </p>
        </Box>
      </Stack>
    </Paper>
  );
};

export { UserInformation };
