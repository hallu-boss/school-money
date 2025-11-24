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

export interface TransactionHistoryRow {
  id: string;
  user: string;
  desc: string;
  amount: number;
  date: string;
}

interface TransactionHistoryTableProps {
  transactions: TransactionHistoryRow[];
}

export const TransactionHistoryTable = ({ transactions }: TransactionHistoryTableProps) => {
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
                <TableCell>{t.user}</TableCell>
                <TableCell>{t.desc}</TableCell>
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
