'use client';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { withdrawFromCollection, depositToCollection, cancelCollection } from '../actions/actions';
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from './ConfirmDialog';

interface TreasurerActionButtonsRowProps {
  collectionBalance: number;
  userBalance: number;
  userId: string;
  collectionId: string;
}

export const TreasurerActionButtonsRow = ({
  collectionBalance,
  userBalance,
  userId,
  collectionId,
}: TreasurerActionButtonsRowProps) => {
  const router = useRouter();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [reasonError, setReasonError] = useState<string>('');

  // Handlers for Withdraw Dialog
  const handleWithdrawClickOpen = () => {
    setWithdrawOpen(true);
    setAmount('');
    setReason('');
    setAmountError('');
    setReasonError('');
  };

  const handleWithdrawClose = () => {
    setWithdrawOpen(false);
    setAmount('');
    setReason('');
    setAmountError('');
    setReasonError('');
  };

  // Handlers for Deposit Dialog
  const handleDepositClickOpen = () => {
    setDepositOpen(true);
    setAmount('');
    setReason('');
    setAmountError('');
    setReasonError('');
  };

  const handleDepositClose = () => {
    setDepositOpen(false);
    setAmount('');
    setReason('');
    setAmountError('');
    setReasonError('');
  };

  // Handlers for Cancel Collection Dialog
  const handleCancelClickOpen = () => {
    setCancelOpen(true);
  };

  const handleCancelClose = () => {
    setCancelOpen(false);
  };

  const handleCancelConfirm = async () => {
    try {
      await cancelCollection(collectionId, userId);
      handleCancelClose();
      router.refresh();
      // Możesz też dodać tu dodatkowe akcje po udanym zamknięciu zbiórki
    } catch (error) {
      console.error('Błąd podczas zamykania zbiórki:', error);
      // Tutaj możesz dodać obsługę błędów, np. wyświetlenie snackbar/alert
    }
  };

  const handleWithdrawAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

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

  const handleDepositAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);

    if (value === '') {
      setAmountError('');
      return;
    }

    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue <= 0) {
      setAmountError('Kwota musi być liczbą większą od zera');
    } else if (numValue > userBalance) {
      setAmountError(`Kwota nie może przekraczać Twoich środków (${userBalance} zł)`);
    } else if (!/^\d*\.?\d{0,2}$/.test(value)) {
      setAmountError('Kwota może mieć maksymalnie 2 miejsca po przecinku');
    } else {
      setAmountError('');
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReason(value);

    if (value.trim() === '') {
      setReasonError('Powód nie może być pusty');
    } else {
      setReasonError('');
    }
  };

  const handleWithdrawSubmit = () => {
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

    withdrawFromCollection(collectionId, userId, numValue, reason.trim());
    handleWithdrawClose();
    router.refresh();
  };

  const handleDepositSubmit = () => {
    const numValue = parseFloat(amount);

    if (isNaN(numValue) || numValue <= 0) {
      setAmountError('Kwota musi być liczbą większą od zera');
      return;
    }

    if (numValue > userBalance) {
      setAmountError(`Kwota nie może przekraczać Twoich środków (${userBalance} zł)`);
      return;
    }

    if (reason.trim() === '') {
      setReasonError('Powód wpłaty nie może być pusty');
      return;
    }

    depositToCollection(collectionId, userId, numValue, reason.trim());
    handleDepositClose();
    router.refresh();
  };

  const isFormValid = !amountError && !reasonError && amount && reason;

  return (
    <Box display="flex" justifyContent="flex-end" gap={2}>
      <Button variant="outlined" color="primary" onClick={handleWithdrawClickOpen}>
        Wypłać pieniądze
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={handleCancelClickOpen}
        disabled={userBalance !== 0}
      >
        Zamknij zbiórkę
      </Button>

      <Button variant="outlined" color="primary" onClick={handleDepositClickOpen}>
        Wpłać pieniądze
      </Button>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onClose={handleWithdrawClose} maxWidth="sm" fullWidth>
        <DialogTitle>Wypłać pieniądze ze zbiórki</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Dostępne środki w zbiórce: <strong>{collectionBalance} zł</strong>
          </Alert>

          <TextField
            autoFocus
            margin="dense"
            label="Kwota do wypłaty"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={handleWithdrawAmountChange}
            error={!!amountError}
            helperText={amountError || 'Wprowadź kwotę do wypłaty'}
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
            helperText={reasonError || 'Wprowadź powód wypłaty (np. zakup materiałów)'}
            placeholder="Wprowadź powód wypłaty..."
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWithdrawClose}>Anuluj</Button>
          <Button
            onClick={handleWithdrawSubmit}
            disabled={!isFormValid}
            variant="contained"
            color="primary"
          >
            Wypłać
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onClose={handleDepositClose} maxWidth="sm" fullWidth>
        <DialogTitle>Wpłać pieniądze do zbiórki</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Twoje dostępne środki: <strong>{userBalance} zł</strong>
          </Alert>

          <TextField
            autoFocus
            margin="dense"
            label="Kwota do wpłaty"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={handleDepositAmountChange}
            error={!!amountError}
            helperText={amountError || 'Wprowadź kwotę do wpłaty'}
            placeholder="0.00"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Powód wpłaty"
            type="text"
            fullWidth
            variant="outlined"
            value={reason}
            onChange={handleReasonChange}
            error={!!reasonError}
            helperText={reasonError || 'Wprowadź powód wpłaty (np. dopłata do zbiórki)'}
            placeholder="Wprowadź powód wpłaty..."
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDepositClose}>Anuluj</Button>
          <Button
            onClick={handleDepositSubmit}
            disabled={!isFormValid}
            variant="contained"
            color="primary"
          >
            Wpłać
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Collection Confirmation Dialog */}
      <ConfirmationDialog
        open={cancelOpen}
        title="Zamknij zbiórkę"
        message="Czy na pewno chcesz zamknąć tę zbiórkę? Tej operacji nie można cofnąć."
        confirmText="Tak, zamknij zbiórkę"
        cancelText="Nie, anuluj"
        confirmColor="error"
        onConfirm={handleCancelConfirm}
        onCancel={handleCancelClose}
      />
    </Box>
  );
};
