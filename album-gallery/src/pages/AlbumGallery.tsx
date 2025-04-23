// pages/AlbumGallery.tsx
import { 
  Box, 
  Button, 
  ToggleButton, 
  ToggleButtonGroup,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAlbums } from '../api/albums';
import AlbumList from '../components/AlbumList/AlbumList';
import PhotoGrid from '../components/PhotoGrid/PhotoGrid';
import AlbumForm from '../components/AlbumForm/AlbumForm';
import { useAppDispatch, useAppSelector } from '../store';
import { setViewType } from '../store/slices/albumsSlice';
import SearchPhotos from '../components/SearchPhotos/SearchPhotos';

export default function AlbumGallery() {
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const viewType = useAppSelector((state) => state.albums.viewType);
  const dispatch = useAppDispatch();

  const { 
    data: albums, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['albums'],
    queryFn: fetchAlbums,
  });

  const handleViewTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewType: 'table' | 'folder'
  ) => {
    if (newViewType !== null) {
      dispatch(setViewType(newViewType));
    }
  };

  const handleAlbumCreated = () => {
    setShowAlbumForm(false);
    refetch();
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1">
          Photo Album Gallery
        </Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewTypeChange}
          aria-label="album view type"
          size="small"
        >
          <ToggleButton value="table">Table View</ToggleButton>
          <ToggleButton value="folder">Folder View</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading albums. Please try again.
        </Alert>
      )}

      <Box display="flex" height="calc(100% - 48px)" gap={2}>
        <Box width="30%" display="flex" flexDirection="column" gap={2}>
          <Paper elevation={2} sx={{ p: 2 }}>
            {showAlbumForm ? (
              <AlbumForm onCancel={handleAlbumCreated} />
            ) : (
              <Button 
                variant="contained" 
                onClick={() => setShowAlbumForm(true)}
                fullWidth
                sx={{ mb: 2 }}
              >
                Create New Album
              </Button>
            )}
            
            {isLoading ? (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
              </Box>
            ) : (
              <AlbumList
                albums={albums || []}
                viewType={viewType}
                onSelect={setSelectedAlbumId}
                onCreateNew={() => setShowAlbumForm(true)}
              />
            )}
          </Paper>

          {selectedAlbumId && (
            <SearchPhotos albumId={selectedAlbumId} />
          )}
        </Box>
        
        <Box width="70%">
          <Paper elevation={2} sx={{ height: '100%', p: 2 }}>
            {selectedAlbumId ? (
              <PhotoGrid albumId={selectedAlbumId} />
            ) : (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
                flexDirection="column"
              >
                <Typography variant="h6" color="text.secondary" mb={2}>
                  Select an album to view photos
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setShowAlbumForm(true)}
                >
                  Or create a new album
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}