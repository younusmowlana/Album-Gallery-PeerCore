import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AlbumsState {
  viewType: 'table' | 'folder'
}

const initialState: AlbumsState = {
  viewType: 'table',
}

export const albumsSlice = createSlice({
  name: 'albums',
  initialState,
  reducers: {
    setViewType: (state, action: PayloadAction<'table' | 'folder'>) => {
      state.viewType = action.payload
    },
  },
})

export const { setViewType } = albumsSlice.actions
export default albumsSlice.reducer