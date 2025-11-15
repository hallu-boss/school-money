'use client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { getUserChildren } from './actions/actions';

type AssignChildDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const AssignChildDialog = ({ open, onClose }: AssignChildDialogProps) => {
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedChild, setSelectedChild] = useState<string>('');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Przypisz dziecko do klasy</DialogTitle>
    </Dialog>
  );
};
