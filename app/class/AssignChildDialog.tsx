'use client';

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { assignChildToClass, getUserChildren, getUserSchoolsAndClasses } from './actions/actions';

type ChildType = { id: string; name: string };
type SchoolType = { id: string; name: string; classes: { id: string; name: string }[] };

type AssignChildDialogProps = {
  open: boolean;
  onClose: () => void;
  onAssigned?: () => void;
};

export const AssignChildDialog = ({ open, onClose, onAssigned }: AssignChildDialogProps) => {
  const [children, setChildren] = useState<ChildType[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [availableClasses, setAvailableClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open) {
      fetchChildren();
      fetchSchools();
      setSelectedChild('');
      setSelectedSchool('');
      setSelectedClass('');
      setAvailableClasses([]);
    }
  }, [open]);

  const fetchChildren = async () => {
    const data = await getUserChildren(); // dzieci nieprzypisane do klasy
    setChildren(data);
  };

  const fetchSchools = async () => {
    const data = await getUserSchoolsAndClasses(); // szkoły + klasy użytkownika
    setSchools(data);
  };

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchool(schoolId);
    const school = schools.find((s) => s.id === schoolId);
    setAvailableClasses(school?.classes || []);
    setSelectedClass('');
  };

  const handleAssign = async () => {
    if (!selectedChild || !selectedClass) return;
    await assignChildToClass(selectedChild, selectedClass);
    onAssigned?.();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Przypisz dziecko do klasy</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={2}>
          <FormControl fullWidth>
            <InputLabel>Dziecko</InputLabel>
            <Select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              label="Dziecko"
            >
              {children.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Szkoła</InputLabel>
            <Select
              value={selectedSchool}
              onChange={(e) => handleSchoolChange(e.target.value)}
              label="Szkoła"
            >
              {schools.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Klasa</InputLabel>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              label="Klasa"
              disabled={!selectedSchool}
            >
              {availableClasses.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={onClose} color="inherit">
              Anuluj
            </Button>
            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={!selectedChild || !selectedClass}
            >
              Przypisz
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
