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
import { Child } from '@prisma/client';
import { Card, CardActionArea, CardContent } from '@mui/material';
import React, { useState } from 'react';

type ChildCardProps = {
  child?: Child;
};

const ChildCard = ({ child }: ChildCardProps) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (!child) {
    return (
      <Paper sx={{ bgcolor: 'grey.80', p: 2, textAlign: 'center' }}>
        Brak informacji o użytkowniku
      </Paper>
    );
  }

  const basicInformation = () => {
    return (
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box>
          <Avatar
            src={child.avatarUrl || undefined}
            alt={child.name || 'Użytkownik'}
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
          {/* TODO: dodać klasę ucznia*/}
          <Typography variant="h3" color="#01579b">
            IIIC
          </Typography>
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
          <CardContent>{basicInformation()};</CardContent>
        </CardActionArea>
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{basicInformation()}</DialogTitle>
        <DialogContent dividers>
          <Typography margin={2} variant="body1">
            <b>Wiek: </b>9{/* TODO: prawdziwe dane*/}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { ChildCard };
