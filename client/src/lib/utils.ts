import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert text to URL-friendly slug
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Convert slug back to display format (optional, for breadcrumbs etc)
export function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getMediaUrl = (path: string) => {
  // If the path already starts with http, return as-is
  if (path.startsWith('http')) return path;
  
  // If path starts with /uploads, prepend api domain
  if (path.startsWith('/uploads')) {
    return `https://api.talantaart.com${path}`;
  }
  
  // For any other paths (like placeholder), use api domain
  return `https://api.talantaart.com${path.startsWith('/') ? path : `/${path}`}`;
};