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
import {
  withdrawFromCollection,
  depositToCollection,
  cancelCollection,
  closeCollection,
} from '../actions/actions';
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from './ConfirmDialog';

interface TreasurerActionButtonsRowProps {
  goal: number;
  collectionBalance: number;
  userBalance: number;
  userId: string;
  collectionId: string;
}

export const TreasurerActionButtonsRow = ({
  goal,
  collectionBalance,
  userBalance,
  userId,
  collectionId,
}: TreasurerActionButtonsRowProps) => {
  const router = useRouter();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false); // Dodano stan dla zakończenia zbiórki
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

  // Handlers for Close Collection Dialog (dodano)
  const handleCloseClickOpen = () => {
    setCloseOpen(true);
  };

  const handleCloseClose = () => {
    setCloseOpen(false);
  };

  const handleCancelConfirm = async () => {
    try {
      await cancelCollection(collectionId, userId);
      handleCancelClose();
      router.refresh();
    } catch (error) {
      console.error('Błąd podczas zamykania zbiórki:', error);
    }
  };

  // Dodano funkcję do potwierdzenia zakończenia zbiórki
  const handleCloseConfirm = async () => {
    try {
      await closeCollection(collectionId, userId);
      handleCloseClose();
      router.refresh();
    } catch (error) {
      console.error('Błąd podczas zakończenia zbiórki:', error);
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
        disabled={collectionBalance !== 0} // Zbiórkę można anulować tylko gdy saldo jest 0
      >
        Anuluj zbiórkę
      </Button>

      {/* Dodano przycisk "Zakończ zbiórkę" - widoczny tylko gdy zebrano pełną kwotę */}
      {collectionBalance === goal && (
        <Button variant="contained" color="success" onClick={handleCloseClickOpen}>
          Zakończ zbiórkę
        </Button>
      )}

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
        title="Anuluj zbiórkę"
        message="Czy na pewno chcesz anulować tę zbiórkę? Tej operacji nie można cofnąć. Zbiórkę można anulować tylko gdy saldo wynosi 0 zł."
        confirmText="Tak, anuluj zbiórkę"
        cancelText="Nie, anuluj"
        confirmColor="error"
        onConfirm={handleCancelConfirm}
        onCancel={handleCancelClose}
      />

      {/* Close Collection Confirmation Dialog (dodano) */}
      <ConfirmationDialog
        open={closeOpen}
        title="Zakończ zbiórkę"
        message="Czy na pewno chcesz zakończyć tę zbiórkę? Po zakończeniu zbiórki nie będzie możliwości dokonywania wpłat ani wypłat."
        confirmText="Tak, zakończ zbiórkę"
        cancelText="Nie, anuluj"
        confirmColor="success"
        onConfirm={handleCloseConfirm}
        onCancel={handleCloseClose}
      />
    </Box>
  );
};
