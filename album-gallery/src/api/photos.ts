// api/photos.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Photo {
  id: number;
  albumId: number;
  title: string;
  url: string;
  createdAt: string;
}

export const fetchPhotosByAlbumId = async (albumId: number): Promise<Photo[]> => {
  const response = await axios.get(`${API_URL}/photos?albumId=${albumId}`);
  return response.data;
};

export const uploadPhoto = async (formData: FormData): Promise<Photo> => {
  const response = await axios.post(`${API_URL}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const addPhotoFromUrl = async (albumId: number, url: string): Promise<Photo> => {
  const response = await axios.post(`${API_URL}/photos`, {
    albumId,
    url,
    title: 'Imported from URL',
  });
  return response.data;
};

export const searchUnsplashPhotos = async (query: string): Promise<any[]> => {
  const response = await axios.get(`https://api.unsplash.com/search/photos`, {
    params: {
      query,
      per_page: 10,
      client_id: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
    },
  });
  return response.data.results;
};