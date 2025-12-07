'use client';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { redirect } from 'next/navigation';

interface BackToClassButtonProps {
  classId: string;
}

export default function BackToClassButton({ classId }: BackToClassButtonProps) {
  return (
    <IconButton sx={{ alignSelf: 'flex-start' }} onClick={() => redirect(`/class/${classId}`)}>
      <ArrowBackIcon />
    </IconButton>
  );
}
