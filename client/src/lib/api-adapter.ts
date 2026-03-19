// API adapter to handle both Express and Strapi backends
import { strapiAPI } from './strapiClient';

// Configuration to switch between Express and Strapi
const USE_STRAPI = import.meta.env.VITE_USE_STRAPI === 'true';
const EXPRESS_API_URL = import.meta.env.VITE_EXPRESS_API_URL;

// Express API requests (current implementation)
async function expressRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${EXPRESS_API_URL}${endpoint}`, {

    credentials: 'include',
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}


// Unified API interface
export const api = {
  // Artists
  async getArtists() {
    return USE_STRAPI ? strapiAPI.getArtists() : expressRequest('/artists');
  },

  async getFeaturedArtists() {
    return USE_STRAPI ? strapiAPI.getFeaturedArtists() : expressRequest('/artists/featured');
  },

  async getArtist(id: string) {
    return USE_STRAPI ? strapiAPI.getArtist(id) : expressRequest(`/artists/${id}`);
  },

  // Artworks
  async getArtworks() {
    return USE_STRAPI ? strapiAPI.getArtworks() : expressRequest('/artworks');
  },

  async getFeaturedArtworks() {
    return USE_STRAPI ? strapiAPI.getFeaturedArtworks() : expressRequest('/artworks/featured');
  },

  async getArtwork(id: string) {
    return USE_STRAPI ? strapiAPI.getArtwork(id) : expressRequest(`/artworks/${id}`);
  },

  async searchArtworks(query: string) {
    return USE_STRAPI 
      ? strapiAPI.searchArtworks(query) 
      : expressRequest(`/search?query=${encodeURIComponent(query)}`);
  },

  // Exhibitions
  async getExhibitions() {
    return USE_STRAPI ? strapiAPI.getExhibitions() : expressRequest('/exhibitions');
  },

  async getCurrentExhibition() {
    return USE_STRAPI ? strapiAPI.getCurrentExhibition() : expressRequest('/exhibitions/current');
  },

  // Admin operations (continue using Express for now)
  async adminLogin(credentials: { username: string; password: string }) {
    return expressRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async createArtist(data: any, token: string) {
    return expressRequest('/artists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  async updateArtist(id: number, data: any, token: string) {
    return expressRequest(`/artists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  async deleteArtist(id: number, token: string) {
    return expressRequest(`/artists/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  async createArtwork(data: any, token: string) {
    return expressRequest('/artworks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  async updateArtwork(id: number, data: any, token: string) {
    return expressRequest(`/artworks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },

  async deleteArtwork(id: number, token: string) {
    return expressRequest(`/artworks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Orders
  async getOrders(token: string) {
    return expressRequest('/orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Newsletter
  async subscribeNewsletter(email: string) {
    return expressRequest('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};