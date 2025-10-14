"use client";

import { Button } from "@mui/material";
import { signOut } from "next-auth/react";

const SignOut = () => {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex justify-center">
      <Button variant="contained" onClick={handleSignOut} color="error">
        Sign Out
      </Button>
    </div>
  );
};

export { SignOut };