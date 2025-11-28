import { Box, Button } from "@mui/material"

export const TreasurerActionButtonsRow = () => {
    return (
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="primary">
            Wypłać pieniądze
          </Button>

          <Button variant="outlined" color="error">
            Zamknij zbiórkę
          </Button>

          <Button variant="outlined" color="primary">
            Wpłać pieniądze
          </Button>
        </Box>
    )
}