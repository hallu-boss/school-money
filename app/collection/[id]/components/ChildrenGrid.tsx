import { Box, Typography, Grid, Paper, Avatar, Button } from '@mui/material';
import { Child } from '@prisma/client';

export type ChildStatus = "UNPAID" | "PAID" | "SIGNED_OFF";

export type ChildData = Pick<Child, 'id' | 'name' | 'avatarUrl'> & { status: ChildStatus };

interface ChildrenGridProps {
  childrenData: ChildData[];
}

export const ChildrenGrid = ({ childrenData }: ChildrenGridProps) => {
  const unpaid = childrenData.filter(c => c.status === "UNPAID");
  const paid = childrenData.filter(c => c.status === "PAID");
  const signedOff = childrenData.filter(c => c.status === "SIGNED_OFF");

  const renderChild = (child: ChildData, action?: React.ReactNode, faded?: boolean) => (
    <Grid size={6} key={child.id}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          opacity: faded ? 0.45 : 1,
          transition: "0.25s",
        }}
      >
        <Avatar src={child.avatarUrl ?? ''} />
        <Typography flexGrow={1} fontSize="1rem">{child.name}</Typography>
        {action}
      </Paper>
    </Grid>
  );

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {/* ====================== UNPAID ====================== */}
      <Box>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Dzieci bez wpłat
        </Typography>

        <Grid container spacing={2}>
          {unpaid.length > 0
            ? unpaid.map(ch => renderChild(ch, <Button variant="contained">Zapłać</Button>))
            : <Typography sx={{ opacity: 0.6 }}>Brak dzieci w tej kategorii</Typography>}
        </Grid>
      </Box>

      {/* ====================== PAID ====================== */}
      <Box>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Dzieci z opłaconym udziałem
        </Typography>

        <Grid container spacing={2}>
          {paid.length > 0
            ? paid.map(ch => renderChild(ch, <Button variant="outlined">Podgląd</Button>))
            : <Typography sx={{ opacity: 0.6 }}>Brak dzieci w tej kategorii</Typography>}
        </Grid>
      </Box>

      {/* ====================== SIGNED OFF ====================== */}
      <Box>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Dzieci wypisane ze zbiórki
        </Typography>

        <Grid container spacing={2}>
          {signedOff.length > 0
            ? signedOff.map(ch =>
                renderChild(ch, <Button disabled>WYPISANO</Button>, true)
              )
            : <Typography sx={{ opacity: 0.6 }}>Brak dzieci w tej kategorii</Typography>}
        </Grid>
      </Box>
    </Box>
  );
};
