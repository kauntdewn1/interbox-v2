import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

export default function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useClerkAuth();

  return {
    user,
    isLoaded,
    isSignedIn,
    loading: !isLoaded,
    logout: signOut,
    getToken,
  };
}