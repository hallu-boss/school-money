'use client';
import { useState, useEffect } from 'react';
import { Paper, Stack, Typography, Avatar, Box, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ChildWithRelations } from './ChildCard';
import { AddChildDialog } from './AddChildDialog';
import { EditChildDialog } from './EditChildDialog';
import { getUserChildren, abortChild } from '../actions/actions';

export const ChildSection = () => {
  const [childrenList, setChildrenList] = useState<ChildWithRelations[]>([]);
  const [openAddChild, setOpenAddChild] = useState(false);
  const [openEditChild, setOpenEditChild] = useState(false);
  const [activeChild, setActiveChild] = useState<ChildWithRelations | null>(null);

  // Fetch dzieci przy montowaniu
  useEffect(() => {
    const fetchChildren = async () => {
      const data = await getUserChildren();

      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

      setChildrenList(sortedData);
    };
    fetchChildren();
  }, []);

  // Funkcja odświeżania listy dzieci
  const refreshChildren = async () => {
    const data = await getUserChildren();

    const sortedData = data.sort((a, b) => {
      // Porównanie alfabetyczne imion
      return a.name.localeCompare(b.name);
    });

    setChildrenList(sortedData);
  };

  const handleDeleteChild = async (id: string) => {
    try {
      await abortChild(id);
      refreshChildren();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditChild = (child: ChildWithRelations) => {
    setActiveChild(child);
    setOpenEditChild(true);
  };

  return (
    <Paper sx={{ p: 4, mb: 4 }}>
      {/* Nagłówek */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Moje dzieci
        </Typography>
        <Button
          variant="outlined"
          endIcon={<EditIcon />}
          sx={{ mt: 1 }}
          onClick={() => setOpenAddChild(true)}
        >
          Dodaj dziecko
        </Button>
      </Stack>

      {/* Lista dzieci */}
      <Stack spacing={2}>
        {childrenList.map((child) => (
          <Paper
            key={child.id}
            variant="outlined"
            sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <Avatar
              src={child.avatarUrl ?? undefined}
              alt={child.name}
              sx={{ width: 56, height: 56 }}
            />
            <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start">
              {/* Imię i nazwisko */}
              <Typography fontWeight="bold" variant="subtitle1">
                {child.name ?? 'Brak imienia'}
              </Typography>

              {/* Szkoła */}
              <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                Szkoła: {child.membership?.class.School?.name ?? 'Brak szkoły'}
              </Typography>

              {/* Klasa */}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Klasa: {child.membership?.class.name ?? 'Brak klasy'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <IconButton color="primary" onClick={() => handleEditChild(child)} sx={{ p: 1 }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton color="error" onClick={() => handleDeleteChild(child.id)} sx={{ p: 1 }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Dialogi */}
      <AddChildDialog open={openAddChild} onClose={() => setOpenAddChild(false)} />
      {activeChild && (
        <EditChildDialog
          open={openEditChild}
          onClose={() => setOpenEditChild(false)}
          child={activeChild}
          onUpdateChild={refreshChildren}
        />
      )}
    </Paper>
  );
};
