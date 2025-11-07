'use client';

import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOut } from './SignOut';

export default function Navbar() {
  const pathname = usePathname();
  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">SchoolMoney</Typography>
        <Button component={Link} href="/" color="inherit">
          Home
        </Button>

        <Button component={Link} href="/profile" color="inherit">
          Profil
        </Button>

        <SignOut />
      </Toolbar>
    </AppBar>
  );
}
