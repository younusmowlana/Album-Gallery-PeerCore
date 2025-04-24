import axios from 'axios';

const API_URL = 'http://localhost:3000/albums';

export const fetchAlbums = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createAlbum = async (albumData: { title: string; description?: string }) => {
  const existingAlbums = (await axios.get(API_URL)).data;
  const maxId = existingAlbums.reduce((max: number, album: any) => {
    const idNum = typeof album.id === 'string' ? parseInt(album.id, 10) || 0 : album.id;
    return Math.max(max, idNum);
  }, 0);
  
  const newId = (maxId + 1).toString();

  const response = await axios.post(API_URL, {
    ...albumData,
    id: newId,
    createdAt: new Date().toISOString(),
  });
  return response.data;
};