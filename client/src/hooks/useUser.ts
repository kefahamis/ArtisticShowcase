import { useArtistAuth } from "./useArtistAuth";

export function useUser() {
  const { user, isAuthenticated } = useArtistAuth();
  
  // Return user email if authenticated, otherwise return a guest identifier
  const userEmail = isAuthenticated && user?.email ? user.email : "guest@example.com";
  
  return {
    userEmail,
    isAuthenticated,
    user
  };
}