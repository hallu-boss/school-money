'use client';

import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOut } from './SignOut';

interface NavbarProps {
  balance: string;
}

export default function Navbar({ balance }: NavbarProps) {
  const pathname = usePathname();

  const pages = [
    { name: 'Profil', href: '/profile' },
    { name: 'Klasa', href: '/class' },
  ];
  return (
    <AppBar position="static" color="primary">
      <Toolbar disableGutters sx={{ px: 2 }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          SchoolMoney
        </Typography>
        {pages.map((page) => (
          <Button
            key={page.href}
            component={Link}
            href={page.href}
            sx={{
              color: pathname === page.href ? '#FFD700' : '#ffffff',
              fontWeight: pathname === page.href ? 'bold' : 'normal',
              textDecoration: pathname === page.href ? 'underline' : 'none',
            }}
          >
            {page.name}
          </Button>
        ))}
        <Box sx={{ flexGrow: 1 }}></Box>
        <Typography sx={{m: 2}}>
          {balance}
        </Typography>
        <SignOut />
      </Toolbar>
    </AppBar>
  );
}
