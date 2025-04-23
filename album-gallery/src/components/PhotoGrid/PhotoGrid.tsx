// components/PhotoGrid/PhotoGrid.tsx
import { 
  Grid, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  CircularProgress, 
  Alert,
  IconButton,
  Tooltip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Box
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchPhotosByAlbumId } from '../../api/photos';
import { useAppDispatch, useAppSelector } from '../../store';
import { setViewMode } from '../../store/slices/photosSlice';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import PhotoUploadModal from '../PhotoUploadModal/PhotoUploadModal';
import { useState } from 'react';
import { format } from 'date-fns';

export default function PhotoGrid({ albumId }: { albumId: number }) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const viewMode = useAppSelector((state) => state.photos.viewMode);
  const dispatch = useAppDispatch();

  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['photos', albumId],
    queryFn: () => fetchPhotosByAlbumId(albumId),
  });

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: 'grid' | 'slideshow'
  ) => {
    if (newViewMode !== null) {
      dispatch(setViewMode(newViewMode));
    }
  };

  if (isLoading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Alert severity="error" sx={{ mt: 2 }}>
      Error loading photos. Please try again.
    </Alert>
  );

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Photos</Typography>
        <Box>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="photo view mode"
            size="small"
          >
            <ToggleButton value="grid">Grid</ToggleButton>
            <ToggleButton value="slideshow">Slideshow</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title="Add photos">
            <IconButton 
              color="primary" 
              onClick={() => setUploadModalOpen(true)}
              sx={{ ml: 1 }}
            >
              <AddPhotoAlternateIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {photos?.map((photo) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  image={photo.url}
                  alt={photo.title}
                  sx={{ 
                    height: 200,
                    objectFit: 'cover'
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="subtitle1">
                    {photo.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(photo.createdAt), 'MMM dd, yyyy')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <div>Slideshow view will be implemented here</div>
      )}

      <PhotoUploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        albumId={albumId}
      />
    </div>
  );
}