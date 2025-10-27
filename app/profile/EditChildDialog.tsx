'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { Child } from '@prisma/client';
import { updateUserProfile } from './actions';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type EditChildDialogProps = {
  open: boolean;
  onClose: () => void;
  child: Child;
};

export const EditProfileDialog = ({ open, onClose, child }: EditChildDialogProps) => {
  return <></>;
};
