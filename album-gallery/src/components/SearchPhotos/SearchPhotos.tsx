// components/SearchPhotos/SearchPhotos.tsx
import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { searchUnsplashPhotos, addPhotoFromUrl } from '../../api/photos';
import AddIcon from '@mui/icons-material/Add';

export default function SearchPhotos({ albumId }: { albumId: number }) {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['unsplash', searchTerm],
    queryFn: () => searchUnsplashPhotos(searchTerm),
    enabled: searchTerm !== '',
  });

  const mutation = useMutation({
    mutationFn: (url: string) => addPhotoFromUrl(albumId, url),
    onSuccess: () => {
      // Invalidate photos query to refresh the list
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Search Unsplash Photos
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search for photos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!query.trim()}
          >
            Search
          </Button>
        </Box>
      </Box>

      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error searching photos. Please try again.
        </Alert>
      )}

      {photos && (
        <Grid container spacing={2}>
          {photos.map((photo: any) => (
            <Grid item xs={12} sm={6} key={photo.id}>
              <Card sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  image={photo.urls.small}
                  alt={photo.alt_description || 'Unsplash photo'}
                  sx={{ height: 150, objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="body2" noWrap>
                    {photo.alt_description || 'No description'}
                  </Typography>
                  <Tooltip title="Add to album">
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
                      onClick={() => mutation.mutate(photo.urls.regular)}
                      disabled={mutation.isLoading}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}