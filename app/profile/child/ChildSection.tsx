'use client';

import { Child, User } from '@prisma/client';
import { ChildWithRelations } from './ChildCard';
import { useState } from 'react';
import { AddChildDialog } from './AddChildDialog';
import { Avatar, Box, Paper, Typography, Stack, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { School } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { abortChild } from '../actions/actions';
import { EditChildDialog } from './EditChildDialog';

type ChildSectionProps = {
  childrenList: ChildWithRelations[];
};

export const ChildSection = ({ childrenList }: ChildSectionProps) => {
  const [openAddChild, setOpenAddChild] = useState(false);
  const [openEditChild, setOpenEditChild] = useState(false);

  const handleDeleteChild = (id: string) => {
    try {
      const result = abortChild(id);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditChild = (child: Child) => {
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
            <Avatar src={child.avatarUrl} alt={child.name} sx={{ width: 56, height: 56 }} />
            <Box flex={1}>
              <Typography fontWeight="medium">{child.name}</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <School sx={{ fontSize: 16, color: '#666' }} />
                <Typography variant="body2" color="text.secondary">
                  Klasa {child.membership?.class.name}
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <IconButton color="primary" onClick={() => handleEditChild(child)} sx={{ p: 1 }}>
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton color="error" onClick={() => handleDeleteChild(child.id)} sx={{ p: 1 }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
            <AddChildDialog open={openAddChild} onClose={() => setOpenAddChild(false)} />
            <EditChildDialog
              open={openEditChild}
              onClose={() => setOpenEditChild(false)}
              child={child}
            />
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
};
