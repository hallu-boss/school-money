import { Dialog, DialogContent } from '@mui/material';

type JoinClassDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const JoinClassDialog = ({ open, onClose }: JoinClassDialogProps) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>Dołącz do klasy</DialogContent>
    </Dialog>
  );
};
