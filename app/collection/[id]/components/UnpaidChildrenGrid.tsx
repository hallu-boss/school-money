import { Box, Typography, Grid, Paper, Avatar, Button } from "@mui/material";
import { Child } from "@prisma/client";

type ChildData = Pick<Child, "id" | "name" | "avatarUrl">

interface UnpaidChildrenGridProps {
  unpaidChildren: ChildData[];
}


export const UnpaidChildrenGrid = ({unpaidChildren}: UnpaidChildrenGridProps) => {
  return (
    <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Dzieci bez wpłat
        </Typography>
        <Grid container spacing={2}>
          {unpaidChildren.map((child) => (
            <Grid size={6} key={child.id}>
              <Paper style={{ padding: 12, display: "flex", alignItems: "center", gap: 16 }}>
                <Avatar src={child.avatarUrl ? child.avatarUrl : ""} />
                <Typography flexGrow={1}>{child.name}</Typography>
                <Button variant="contained">Zapłać</Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
  );
}