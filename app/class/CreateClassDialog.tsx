import { Dialog, DialogContent } from '@mui/material';

type CreateClassProps = {
  open: boolean;
  onClose: () => void;
};

export const CreateClassDialog = ({ open, onClose }: CreateClassProps) => {
  const handleClose = () => {
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent> śmieszny</DialogContent>
    </Dialog>
  );
};
