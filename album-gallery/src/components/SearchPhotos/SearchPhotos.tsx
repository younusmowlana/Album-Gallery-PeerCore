// components/SearchPhotos/SearchPhotos.tsx
import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  InputAdornment,
  Skeleton,
  useTheme,
  useMediaQuery,
  Card,
  CardMedia,
} from '@mui/material';
import Masonry from '@mui/lab/Masonry';
import { useMutation, useQuery } from '@tanstack/react-query';
import { searchUnsplashPhotos, addPhotoFromUrl } from '../../api/photos';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {useQueryClient } from '@tanstack/react-query';

export default function SearchPhotos({ albumId }: { albumId: number }) {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['unsplash', searchTerm],
    queryFn: () => searchUnsplashPhotos(searchTerm),
    enabled: searchTerm !== '',
  });

  const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (photo: any) => addPhotoFromUrl(albumId, photo.urls.regular, photo.alt_description || 'Unsplash photo'),
  onSuccess: () => {
    queryClient.invalidateQueries(['photos', albumId]);
  },
});

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mt: 2,
        borderRadius: 2,
        background: theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Search Unsplash Photos
      </Typography>

      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      >
        <Box display="flex" gap={1}>
          <TextField
            fullWidth
            variant="outlined"
            size="medium"
            placeholder="Landscape, nature, portraits..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: theme.palette.background.default,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!query.trim()}
            sx={{
              backgroundColor: "#0d7c73",
              color: "white",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              padding: "6px 16px",
              "&:hover": {
                backgroundColor: "#0a635c",
              },
              "&.Mui-disabled": {
                backgroundColor: "rgba(13, 124, 115, 0.5)",
              },
              transition: "all 0.3s ease",
              boxShadow: "none",
              "&:active": {
                transform: "scale(0.98)",
              },
            }}
          >
            Search
          </Button>
        </Box>
      </Box>

      {isLoading && (
        <Masonry columns={isMobile ? 2 : 3} spacing={2}>
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width="100%"
              height={Math.floor(Math.random() * 100) + 150}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Masonry>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          Error searching photos. Please try again.
        </Alert>
      )}

      {photos && (
        <Box
          sx={{
            maxHeight: 'calc(100vh - 300px)',
            overflowY: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.action.hover,
              borderRadius: '3px',
            },
          }}
        >
          <Masonry columns={isMobile ? 2 : 3} spacing={2}>
            {photos.map((photo: any) => (
              <Card
                key={photo.id}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={photo.urls.small}
                  alt={photo.alt_description || 'Unsplash photo'}
                  sx={{
                    width: '100%',
                    display: 'block',
                  }}
                />
                <Tooltip title="Add to album">
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'background.default',
                      },
                    }}
                    onClick={() => mutation.mutate(photo)}
                    disabled={mutation.isLoading}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {photo.alt_description && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 1,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'common.white',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {photo.alt_description}
                    </Typography>
                  </Box>
                )}
              </Card>
            ))}
          </Masonry>
        </Box>
      )}
    </Paper>
  );
}
