'use client';

import { Child } from '@prisma/client';
import { ChildCard, ChildWithRelations } from './ChildCard';
import { useState } from 'react';
import { AddChildDialog } from './AddChildDialog';
import { Avatar, Box, Paper, Typography, Stack, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

type ChildSectionProps = {
  childrenList: ChildWithRelations[];
};

export const ChildSection = ({ childrenList }: ChildSectionProps) => {
  const [openAddChild, setOpenAddChild] = useState(false);
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        {childrenList.map((child) => (
          <ChildCard key={child.id} child={child} />
        ))}
      </Box>

      <Button
        variant="outlined"
        endIcon={<EditIcon />}
        sx={{ mt: 1 }}
        onClick={() => setOpenAddChild(true)}
      >
        Dodaj dziecko
      </Button>
      <AddChildDialog open={openAddChild} onClose={() => setOpenAddChild(false)} />
    </>
  );
};
