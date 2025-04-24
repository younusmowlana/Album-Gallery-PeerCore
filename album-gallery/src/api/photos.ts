// api/photos.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Photo {
  id: string; 
  albumId: number;
  title: string;
  url: string;
  createdAt: string;
}

export const fetchPhotosByAlbumId = async (albumId: number): Promise<Photo[]> => {
  const response = await axios.get(`${API_URL}/photos?albumId=${albumId}`);
  return response.data;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const uploadPhoto = async (formData: FormData): Promise<Photo> => {
  const title = formData.get('title') as string;
  const albumId = parseInt(formData.get('albumId') as string);
  const file = formData.get('file') as File;

  
  const base64Data = await fileToBase64(file);

  const newPhoto = {
    id: Math.floor(Math.random() * 10000).toString(),
    albumId,
    title,
    url: base64Data, 
    createdAt: new Date().toISOString()
  };

  const response = await axios.post(`${API_URL}/photos`, newPhoto);
  return response.data;
};

export const addPhotoFromUrl = async (
  albumId: number,
  url: string,
  title: string
): Promise<Photo> => {
  const response = await axios.post(`${API_URL}/photos`, {
    albumId,
    url,
    title,
    createdAt: new Date().toISOString()
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