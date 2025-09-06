import { useState } from 'react';

export function useAuthModal() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const openSignIn = () => {
    setIsSignUpOpen(false);
    setIsSignInOpen(true);
  };

  const openSignUp = () => {
    setIsSignInOpen(false);
    setIsSignUpOpen(true);
  };

  const closeAll = () => {
    setIsSignInOpen(false);
    setIsSignUpOpen(false);
  };

  return {
    isSignInOpen,
    isSignUpOpen,
    openSignIn,
    openSignUp,
    closeAll
  };
}
