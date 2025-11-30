'use client';
import { Stack, Typography, Button } from '@mui/material';
import { activateCollection } from '../actions/actions';
import { useRouter } from 'next/navigation';

interface InfoCollectionCanceledProps {
  collectionId: string;
}

export const InfoCollectionCanceled = ({ collectionId }: InfoCollectionCanceledProps) => {
  const router = useRouter();
  const handleActivateCollection = async () => {
    await activateCollection(collectionId);
    router.refresh();
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Typography sx={{ opacity: 0.6 }}>Zbiórka została anulowana</Typography>
      <Button variant="outlined" onClick={handleActivateCollection}>
        Wznów Zbiórkę
      </Button>
    </Stack>
  );
};
