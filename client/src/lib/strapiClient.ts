// Strapi API client configuration
const STRAPI_URL = 'http://localhost:1337';

interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface StrapiEntity {
  id: number;
  attributes: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Transform Strapi entity to match current frontend expectations
export function transformStrapiEntity(entity: StrapiEntity) {
  return {
    id: entity.id,
    ...entity.attributes,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

// Transform Strapi collection response
export function transformStrapiCollection<T>(response: StrapiResponse<StrapiEntity[]>): T[] {
  return response.data.map(entity => transformStrapiEntity(entity));
}

// Transform Strapi single entity response
export function transformStrapiSingle<T>(response: StrapiResponse<StrapiEntity>): T {
  return transformStrapiEntity(response.data);
}

// API request helper for Strapi
export async function strapiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${STRAPI_URL}/api${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// Specific API methods
export const strapiAPI = {
  // Artists
  async getArtists() {
    const response = await strapiRequest('/artists?populate=*');
    return transformStrapiCollection(response);
  },

  async getFeaturedArtists() {
    const response = await strapiRequest('/artists?filters[featured][$eq]=true&populate=*');
    return transformStrapiCollection(response);
  },

  async getArtist(id: string) {
    const response = await strapiRequest(`/artists/${id}?populate=*`);
    return transformStrapiSingle(response);
  },

  // Artworks
  async getArtworks() {
    const response = await strapiRequest('/artworks?populate=*');
    return transformStrapiCollection(response);
  },

  async getFeaturedArtworks() {
    const response = await strapiRequest('/artworks?filters[featured][$eq]=true&populate=*');
    return transformStrapiCollection(response);
  },

  async getArtwork(id: string) {
    const response = await strapiRequest(`/artworks/${id}?populate=*`);
    return transformStrapiSingle(response);
  },

  async searchArtworks(query: string) {
    const response = await strapiRequest(`/artworks?filters[$or][0][title][$containsi]=${query}&filters[$or][1][description][$containsi]=${query}&populate=*`);
    return transformStrapiCollection(response);
  },

  // Exhibitions
  async getExhibitions() {
    const response = await strapiRequest('/exhibitions');
    return transformStrapiCollection(response);
  },

  async getCurrentExhibition() {
    const now = new Date().toISOString();
    const response = await strapiRequest(`/exhibitions?filters[startDate][$lte]=${now}&filters[endDate][$gte]=${now}&sort=startDate:desc&pagination[limit]=1`);
    const exhibitions = transformStrapiCollection(response);
    return exhibitions[0] || null;
  },
};