"use client";
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField,
  Alert 
} from "@mui/material"
import { useState } from "react"
import { withdrawFromCollection } from "../actions/actions";
import { useRouter } from "next/navigation";

interface TreasurerActionButtonsRowProps {
  collectionBalance: number;
  userBalance: number;
  userId: string;
  collectionId: string;
}

export const TreasurerActionButtonsRow = ({ collectionBalance, userId, collectionId }: TreasurerActionButtonsRowProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [reasonError, setReasonError] = useState<string>('');

  const handleClickOpen = () => {
    setOpen(true);
    setAmount('');
    setReason('');
    setAmountError('');
    setReasonError('');
  };

  const handleClose = () => {
    setOpen(false);
    setAmount('');
    setReason('');
    setAmountError('');
    setReasonError('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    // Walidacja
    if (value === '') {
      setAmountError('');
      return;
    }

    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      setAmountError('Kwota musi być liczbą większą od zera');
    } else if (numValue > collectionBalance) {
      setAmountError(`Kwota nie może przekraczać dostępnych środków (${collectionBalance} zł)`);
    } else if (!/^\d*\.?\d{0,2}$/.test(value)) {
      setAmountError('Kwota może mieć maksymalnie 2 miejsca po przecinku');
    } else {
      setAmountError('');
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReason(value);
    
    // Walidacja powodu
    if (value.trim() === '') {
      setReasonError('Powód wypłaty nie może być pusty');
    } else {
      setReasonError('');
    }
  };

  const handleSubmit = () => {
    // Ostateczna walidacja przed zatwierdzeniem
    const numValue = parseFloat(amount);
    
    if (isNaN(numValue) || numValue <= 0) {
      setAmountError('Kwota musi być liczbą większą od zera');
      return;
    }
    
    if (numValue > collectionBalance) {
      setAmountError(`Kwota nie może przekraczać dostępnych środków (${collectionBalance} zł)`);
      return;
    }

    if (reason.trim() === '') {
      setReasonError('Powód wypłaty nie może być pusty');
      return;
    }

    // Wywołanie funkcji wypłaty
    withdrawFromCollection(collectionId, userId, numValue, reason.trim());
    handleClose();
    router.refresh();
  };

  const isFormValid = !amountError && !reasonError && amount && reason;

  return (
    <Box display="flex" justifyContent="flex-end" gap={2}>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Wypłać pieniądze
      </Button>

      <Button variant="outlined" color="error">
        Zamknij zbiórkę
      </Button>

      <Button variant="outlined" color="primary">
        Wpłać pieniądze
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Wypłać pieniądze ze zbiórki</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Dostępne środki: <strong>{collectionBalance} zł</strong>
          </Alert>
          
          <TextField
            autoFocus
            margin="dense"
            label="Kwota do wypłaty"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={handleAmountChange}
            error={!!amountError}
            helperText={amountError || "Wprowadź kwotę do wypłaty"}
            placeholder="0.00"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Powód wypłaty"
            type="text"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={handleReasonChange}
            error={!!reasonError}
            helperText={reasonError || "Wprowadź powód wypłaty (np. zakup materiałów)"}
            placeholder="Wprowadź powód wypłaty..."
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Anuluj</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormValid}
            variant="contained"
            color="primary"
          >
            Wypłać
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}