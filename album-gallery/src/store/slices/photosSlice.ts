// store/slices/photosSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PhotosState {
  viewMode: 'grid' | 'slideshow';
  currentPhotoIndex: number;
}

const initialState: PhotosState = {
  viewMode: 'grid',
  currentPhotoIndex: 0,
};

export const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<'grid' | 'slideshow'>) => {
      state.viewMode = action.payload;
    },
    setCurrentPhotoIndex: (state, action: PayloadAction<number>) => {
      state.currentPhotoIndex = action.payload;
    },
    nextPhoto: (state) => {
      state.currentPhotoIndex += 1;
    },
    prevPhoto: (state) => {
      state.currentPhotoIndex = Math.max(0, state.currentPhotoIndex - 1);
    },
  },
});

export const { 
  setViewMode, 
  setCurrentPhotoIndex,
  nextPhoto,
  prevPhoto
} = photosSlice.actions;

export default photosSlice.reducer;