'use client';

import { Button, Card, Container, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { CreateClassDialog } from './CreateClassDialog';
import { AssignChildDialog } from './AssignChildDialog';
import { JoinClassDialog } from './JoinClassDialog';

export const ClassList = () => {
  // const [classList, setClassList] = useState<>

  const [openCreateClass, setOpenCreateClass] = useState(false);
  const [openJoinClass, setOpenJoinClass] = useState(false);
  const [openAssignChild, setOpenAssignChild] = useState(false);

  //TODO: można zablokować przycisk przypisania dziecka w momencie kiedy nie jesteś przypisany do żadnej klasy
  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
          <Button variant="outlined" onClick={() => setOpenCreateClass(true)}>
            Stwórz klasę
          </Button>
          <Button variant="outlined" onClick={() => setOpenAssignChild(true)}>
            Przypisz dziecko
          </Button>
          <Button variant="outlined" onClick={() => setOpenJoinClass(true)}>
            Dołącz do klasy
          </Button>
        </Stack>
        <Stack spacing={4}>
          <Paper sx={{ bgcolor: 'grey.100', p: 2, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Klasy do których jesteś przypisany
            </Typography>
            <Card>coś</Card>
          </Paper>
        </Stack>
      </Container>

      <CreateClassDialog open={openCreateClass} onClose={() => setOpenCreateClass(false)} />
      <AssignChildDialog open={openAssignChild} onClose={() => setOpenAssignChild(false)} />
      <JoinClassDialog open={openJoinClass} onClose={() => setOpenJoinClass(false)} />
    </>
  );
};
