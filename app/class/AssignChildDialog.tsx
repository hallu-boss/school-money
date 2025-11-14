import { Dialog, DialogContent } from '@mui/material';

type AssignChildDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const AssignChildDialog = ({ open, onClose }: AssignChildDialogProps) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent>Przypisz dziecko</DialogContent>
    </Dialog>
  );
};
