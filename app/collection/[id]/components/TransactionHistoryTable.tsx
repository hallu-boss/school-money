import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Transaction } from '../page';

interface TransactionHistoryTableProps {
  transactions: Transaction[]
}

export const TransactionHistoryTable = ({
  transactions
}: TransactionHistoryTableProps) => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Historia transakcji
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rodzic</TableCell>
              <TableCell>Dziecko</TableCell>
              <TableCell>Kwota</TableCell>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.parent}</TableCell>
                <TableCell>{t.child}</TableCell>
                <TableCell>{t.amount}</TableCell>
                <TableCell>{t.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
