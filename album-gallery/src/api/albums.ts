import axios from 'axios';

const API_URL = 'http://localhost:3000/albums';

export const fetchAlbums = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createAlbum = async (albumData: { title: string; description?: string }) => {
  const response = await axios.post(API_URL, {
    ...albumData,
    createdAt: new Date().toISOString(),
  });
  return response.data;
};