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
  Typography,
  styled,
} from "@mui/material";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAlbums } from "../api/albums";
import AlbumList from "../components/AlbumList/AlbumList";
import PhotoGrid from "../components/PhotoGrid/PhotoGrid";
import AlbumForm from "../components/AlbumForm/AlbumForm";
import { useAppDispatch, useAppSelector } from "../store";
import { setViewType } from "../store/slices/albumsSlice";
import SearchPhotos from "../components/SearchPhotos/SearchPhotos";

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
  height: "100%",
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  padding: theme.spacing(0.5, 1.5),
  fontSize: "0.75rem",
  textTransform: "none",
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(0.5, 1.5),
  fontSize: "0.75rem",
  textTransform: "none",
}));

export default function AlbumGallery() {
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const viewType = useAppSelector((state) => state.albums.viewType);
  const dispatch = useAppDispatch();

  const {
    data: albums,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["albums"],
    queryFn: fetchAlbums,
  });

  const handleViewTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewType: "table" | "folder"
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
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: "#0d7c73",
            letterSpacing: "0.1em",
            textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
            position: "relative",
            display: "inline-block",
            paddingBottom: "8px",
            "&:after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "25%",
              width: "50%",
              height: "3px",
              background:
                "linear-gradient(90deg, transparent, primary.main, transparent)",
              borderRadius: "3px",
            },
            animation: "fadeIn 1s ease-in",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(20px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          Picaso
        </Typography>
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={handleViewTypeChange}
          aria-label="album view type"
          size="small"
          sx={{
            bgcolor: "background.paper",
          }}
        >
          <StyledToggleButton
            value="table"
            sx={{
              "&.Mui-selected": {
                backgroundColor: "#0d7c73",
                color: "white",
                "&:hover": {
                  backgroundColor: "#0a635c",
                },
              },
              color: "#0d7c73",
              border: "1px solid #0d7c73",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.3s ease",
              "&:not(.Mui-selected)": {
                "&:hover": {
                  backgroundColor: "rgba(13, 124, 115, 0.08)",
                },
              },
            }}
          >
            Table View
          </StyledToggleButton>

          <StyledToggleButton
            value="folder"
            sx={{
              "&.Mui-selected": {
                backgroundColor: "#0d7c73",
                color: "white",
                "&:hover": {
                  backgroundColor: "#0a635c",
                },
              },
              color: "#0d7c73",
              border: "1px solid #0d7c73",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.3s ease",
              "&:not(.Mui-selected)": {
                "&:hover": {
                  backgroundColor: "rgba(13, 124, 115, 0.08)",
                },
              },
            }}
          >
            Folder View
          </StyledToggleButton>
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
          <StyledPaper>
            <Box sx={{ p: 2 }}>
              {showAlbumForm ? (
                <AlbumForm onCancel={handleAlbumCreated} />
              ) : (
                <StyledButton
                  variant="contained"
                  onClick={() => setShowAlbumForm(true)}
                  fullWidth
                  sx={{
                    mb: 2,
                    backgroundColor: "#0d7c73",
                    "&:hover": {
                      backgroundColor: "#0a635c",
                    },
                    color: "white",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "8px 16px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    "&:active": {
                      transform: "scale(0.98)",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  Create New Album
                </StyledButton>
              )}

              {isLoading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <AlbumList
                  albums={albums || []}
                  viewType={viewType}
                  onSelect={setSelectedAlbumId}
                  onCreateNew={() => setShowAlbumForm(true)}
                  albumId={selectedAlbumId}
                />
              )}
            </Box>
          </StyledPaper>

          {selectedAlbumId && (
            <StyledPaper sx={{ p: 2 }}>
              <SearchPhotos albumId={selectedAlbumId} />
            </StyledPaper>
          )}
        </Box>

        <Box width="70%">
          <StyledPaper>
            <Box sx={{ p: 2, height: "100%" }}>
              {selectedAlbumId ? (
                <PhotoGrid albumId={selectedAlbumId} />
              ) : (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                  flexDirection="column"
                  sx={{ color: "text.secondary" }}
                >
                  <Typography variant="subtitle1" mb={2}>
                    Select an album to view photos
                  </Typography>
                  <StyledButton
                    variant="outlined"
                    onClick={() => setShowAlbumForm(true)}
                  >
                    Or create a new album
                  </StyledButton>
                </Box>
              )}
            </Box>
          </StyledPaper>
        </Box>
      </Box>
    </Box>
  );
}
