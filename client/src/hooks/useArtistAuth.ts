import { useQuery } from "@tanstack/react-query";

export function useArtistAuth() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/artists/profile"],
    queryFn: async () => {
      const token = localStorage.getItem('artist_token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('/api/artists/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('artist_token');
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to fetch artist profile');
      }

      return response.json();
    },
    retry: false,
  });

  const logout = () => {
    localStorage.removeItem('artist_token');
    window.location.href = '/artist/login';
  };

  return {
    artist: data?.artist,
    user: data?.user,
    isLoading,
    isAuthenticated: !!data && !error,
    error,
    logout
  };
}