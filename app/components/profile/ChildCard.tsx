'use client';

import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import { Child } from '@prisma/client';
import { Card, CardActionArea, CardContent } from '@mui/material';

type ChildCardProps = {
  user?: Child;
  onClick?: () => void;
};

const ChildCard = ({ user, onClick }: ChildCardProps) => {
  if (!user) {
    return (
      <Paper sx={{ bgcolor: 'grey.80', p: 2, textAlign: 'center' }}>
        Brak informacji o użytkowniku
      </Paper>
    );
  }

  return (
    <Card
      elevation={5}
      sx={{
        borderRadius: 5,
        bgcolor: 'grey.80',
        m: 2,
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Box>
              <Avatar
                src={user.avatarUrl || undefined}
                alt={user.name || 'Użytkownik'}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 50,
                  bgcolor: 'primary.main',
                }}
              />
            </Box>
            <Box textAlign={'left'}>
              <Typography variant="h3">{user.name}</Typography>
              {/* TODO: dodać klasę ucznia*/}
              <Typography variant="h3" color="#01579b">
                IIIC
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export { ChildCard };
