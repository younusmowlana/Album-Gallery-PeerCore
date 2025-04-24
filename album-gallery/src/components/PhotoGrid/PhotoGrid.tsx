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
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Skeleton,
  Paper,
  Fade,
  Grow,
  Zoom,
} from "@mui/material";
// import { useQuery } from '@tanstack/react-query';
import { fetchPhotosByAlbumId } from "../../api/photos";
import { useAppDispatch, useAppSelector } from "../../store";
import { setViewMode } from "../../store/slices/photosSlice";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoUploadModal from "../PhotoUploadModal/PhotoUploadModal";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CloseIcon from "@mui/icons-material/Close";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function PhotoGrid({ albumId }: { albumId: number }) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const viewMode = useAppSelector((state) => state.photos.viewMode);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    data: photos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["photos", albumId],
    queryFn: () => fetchPhotosByAlbumId(albumId),
  });

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newViewMode: "grid" | "slideshow"
  ) => {
    if (newViewMode !== null) {
      dispatch(setViewMode(newViewMode));
      if (newViewMode === "slideshow") {
        setSlideshowActive(true);
        setCurrentSlideIndex(0);
      } else {
        setSlideshowActive(false);
      }
    }
  };

  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries(["photos", albumId]);
  }, [albumId, queryClient]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prevIndex) =>
      prevIndex === photos!.length - 1 ? 0 : prevIndex + 1
    );
    setZoomLevel(1);
    setControlsVisible(true);
    setTimeout(() => setControlsVisible(false), 3000);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prevIndex) =>
      prevIndex === 0 ? photos!.length - 1 : prevIndex - 1
    );
    setZoomLevel(1);
    setControlsVisible(true);
    setTimeout(() => setControlsVisible(false), 3000);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!slideshowActive) return;

    switch (e.key) {
      case "ArrowRight":
        handleNextSlide();
        break;
      case "ArrowLeft":
        handlePrevSlide();
        break;
      case "Escape":
        setSlideshowActive(false);
        setFullscreen(false);
        break;
      case "f":
      case "F":
        setFullscreen(!fullscreen);
        break;
      case " ":
        handleNextSlide();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [slideshowActive, photos]);

  useEffect(() => {
    if (slideshowActive) {
      const timer = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [slideshowActive, currentSlideIndex]);

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Skeleton variant="rectangular" width="100%" height={200} />
              <Box sx={{ pt: 0.5 }}>
                <Skeleton width="60%" />
                <Skeleton width="40%" />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );

  if (error)
    return (
      <Zoom in>
        <Alert severity="error" sx={{ mt: 2, maxWidth: 600, mx: "auto" }}>
          Error loading photos. Please try again.
        </Alert>
      </Zoom>
    );

  if (!photos || photos.length === 0)
    return (
      <Fade in>
        <Box textAlign="center" mt={4} p={4}>
          <Typography variant="h6" gutterBottom color="text.secondary">
            This album is empty
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => setUploadModalOpen(true)}
            sx={{
              mt: 2,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            Add First Photo
          </Button>
        </Box>
      </Fade>
    );

  return (
    <Box sx={{ position: "relative", minHeight: "70vh" }}>
      {/* Header Controls */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          backgroundColor: theme.palette.background.paper,
          p: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography variant="h5" fontWeight="medium">
          {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="photo view mode"
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                px: 2,
                border: "none",
                color: "#0d7c73",
                "&.Mui-selected": {
                  backgroundColor: "#0d7c73",
                  color: "white",
                },
                "&:hover": {
                  backgroundColor: "rgba(13, 124, 115, 0.08)",
                },
              },
            }}
          >
            <ToggleButton value="grid">
              <Tooltip title="Grid view">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <ViewModuleIcon fontSize="small" />
                  {!isMobile && "Grid"}
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="slideshow">
              <Tooltip title="Slideshow view">
                <Box display="flex" alignItems="center" gap={0.5}>
                  <SlideshowIcon fontSize="small" />
                  {!isMobile && "Slideshow"}
                </Box>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Add photos">
            <Button
              variant="contained"
              onClick={() => setUploadModalOpen(true)}
              sx={{
                ml: 1,
                minWidth: 0,
                px: isMobile ? 1 : 2,
                borderRadius: 2,
                backgroundColor: "#0d7c73",
                "&:hover": {
                  backgroundColor: "#0a635c",
                },
                "& .MuiButton-startIcon": {
                  mr: isMobile ? 0 : 0.5,
                },
                // Selected state
                "&.Mui-selected": {
                  backgroundColor: "#0a635c",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  "&:hover": {
                    backgroundColor: "#084b45",
                  },
                },
              }}
              startIcon={<AddPhotoAlternateIcon />}
            >
              {!isMobile && "Add"}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          position: "relative",
          transition: "all 0.3s ease",
          ...(fullscreen && {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: theme.zIndex.modal,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }),
        }}
      >
        {!slideshowActive ? (
          <Grid container spacing={3}>
            {photos.map((photo, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                <Grow in timeout={index * 100}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: theme.shadows[6],
                        "& .MuiCardMedia-root": {
                          opacity: 0.9,
                        },
                      },
                    }}
                    onClick={() => {
                      setCurrentSlideIndex(index);
                      setSlideshowActive(true);
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={photo.url}
                      alt={photo.title}
                      sx={{
                        height: 200,
                        objectFit: "cover",
                        cursor: "pointer",
                        transition: "opacity 0.3s",
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="subtitle1" noWrap>
                        {photo.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(photo.createdAt), "MMMM d, yyyy")}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: fullscreen ? "100vh" : "70vh",
              position: "relative",
              overflow: "hidden",
              backgroundColor: fullscreen ? "rgba(0,0,0,0.9)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Slideshow Controls */}
            {controlsVisible && (
              <Fade in={controlsVisible}>
                <Box>
                  {/* Top Controls */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      right: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      zIndex: 2,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      borderRadius: 2,
                      p: 1,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Typography variant="subtitle1" color="common.white">
                      {currentSlideIndex + 1} / {photos.length}
                    </Typography>

                    <Box display="flex" gap={1}>
                      <Tooltip
                        title={
                          fullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"
                        }
                      >
                        <IconButton
                          onClick={() => setFullscreen(!fullscreen)}
                          color="inherit"
                          size="small"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          {fullscreen ? (
                            <FullscreenExitIcon />
                          ) : (
                            <FullscreenIcon />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Zoom in (+)">
                        <IconButton
                          onClick={() =>
                            setZoomLevel((prev) => Math.min(prev + 0.25, 3))
                          }
                          color="inherit"
                          size="small"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <ZoomInIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Zoom out (-)">
                        <IconButton
                          onClick={() =>
                            setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
                          }
                          color="inherit"
                          size="small"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <ZoomOutIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Close (ESC)">
                        <IconButton
                          onClick={() => {
                            setSlideshowActive(false);
                            setFullscreen(false);
                          }}
                          color="inherit"
                          size="small"
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Navigation Arrows */}
                  <IconButton
                    onClick={handlePrevSlide}
                    sx={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "white",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                      zIndex: 2,
                      backdropFilter: "blur(4px)",
                    }}
                    size="large"
                  >
                    <NavigateBeforeIcon fontSize="large" />
                  </IconButton>

                  <IconButton
                    onClick={handleNextSlide}
                    sx={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "white",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                      zIndex: 2,
                      backdropFilter: "blur(4px)",
                    }}
                    size="large"
                  >
                    <NavigateNextIcon fontSize="large" />
                  </IconButton>
                </Box>
              </Fade>
            )}

            {/* Current Slide */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": {
                  "& .slide-info": {
                    opacity: 1,
                  },
                },
              }}
              onClick={() => setControlsVisible(!controlsVisible)}
            >
              <img
                src={photos[currentSlideIndex]?.url}
                alt={photos[currentSlideIndex]?.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: fullscreen ? "90vh" : "60vh",
                  objectFit: "contain",
                  transform: `scale(${zoomLevel})`,
                  transition: "transform 0.3s ease",
                  cursor: zoomLevel > 1 ? "grab" : "pointer",
                }}
                onDoubleClick={() =>
                  setZoomLevel((prev) => (prev === 1 ? 2 : 1))
                }
              />

              <Box
                className="slide-info"
                sx={{
                  color: "white",
                  textAlign: "center",
                  mt: 2,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  padding: 2,
                  borderRadius: 2,
                  maxWidth: "80%",
                  transition: "opacity 0.3s",
                  opacity: controlsVisible ? 1 : 0.7,
                  backdropFilter: "blur(4px)",
                }}
              >
                <Typography variant="h6" fontWeight="medium">
                  {photos[currentSlideIndex]?.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {photos[currentSlideIndex]?.createdAt &&
                    format(
                      new Date(photos[currentSlideIndex]?.createdAt),
                      "MMMM d, yyyy - h:mm a"
                    )}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Start Slideshow Button (shown when in slideshow mode but not active) */}
      {viewMode === "slideshow" && !slideshowActive && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setCurrentSlideIndex(0);
              setSlideshowActive(true);
            }}
            startIcon={<SlideshowIcon />}
            sx={{
              ml: 1,
              minWidth: 0,
              px: isMobile ? 1 : 2,
              borderRadius: 2,
              backgroundColor: "#0d7c73",
              "&:hover": {
                backgroundColor: "#0a635c",
              },
              "& .MuiButton-startIcon": {
                mr: isMobile ? 0 : 0.5,
              },
              // Selected state
              "&.Mui-selected": {
                backgroundColor: "#0a635c",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                "&:hover": {
                  backgroundColor: "#084b45",
                },
              },
            }}
          >
            Start Slideshow
          </Button>
        </Box>
      )}

      <PhotoUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        albumId={albumId}
      />
    </Box>
  );
}
