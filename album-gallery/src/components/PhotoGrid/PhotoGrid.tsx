// components/PhotoGrid/PhotoGrid.tsx
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { fetchPhotosByAlbumId } from "../../api/photos";
import { useAppDispatch, useAppSelector } from "../../store";
import { setViewMode } from "../../store/slices/photosSlice";
import PhotoUploadModal from "../PhotoUploadModal/PhotoUploadModal";
import {
  Box, Typography, Button, IconButton, Tooltip, ToggleButton, ToggleButtonGroup,
  Skeleton, Fade, Grow, Zoom, useTheme, useMediaQuery
} from "@mui/material";
import Masonry from "@mui/lab/Masonry";
import {
  AddPhotoAlternate, NavigateBefore, NavigateNext, Fullscreen,
  FullscreenExit, ZoomIn, ZoomOut, Close, ViewModule, Slideshow
} from "@mui/icons-material";

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

  const { data: photos, isLoading, error } = useQuery({
    queryKey: ["photos", albumId],
    queryFn: () => fetchPhotosByAlbumId(albumId),
  });

  const handleViewModeChange = (_: React.MouseEvent<HTMLElement>, newViewMode: "grid" | "slideshow") => {
    if (newViewMode) {
      dispatch(setViewMode(newViewMode));
      setSlideshowActive(newViewMode === "slideshow");
      if (newViewMode === "slideshow") setCurrentSlideIndex(0);
    }
  };

  const handleSlideNav = (direction: "prev" | "next") => {
    const newIndex = direction === "next" 
      ? (currentSlideIndex + 1) % photos!.length
      : (currentSlideIndex - 1 + photos!.length) % photos!.length;
    setCurrentSlideIndex(newIndex);
    setZoomLevel(1);
    setControlsVisible(true);
    setTimeout(() => setControlsVisible(false), 3000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!slideshowActive) return;
      switch (e.key) {
        case "ArrowRight": handleSlideNav("next"); break;
        case "ArrowLeft": handleSlideNav("prev"); break;
        case "Escape": setSlideshowActive(false); setFullscreen(false); break;
        case "f": case "F": setFullscreen(!fullscreen); break;
        case " ": handleSlideNav("next"); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideshowActive, photos, currentSlideIndex]);


  if (isLoading) return (
    <Masonry columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} spacing={2}>
      {[...Array(8)].map((_, i) => (
        <Box key={i} sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
          <Skeleton variant="rectangular" width="100%" height={0} sx={{ paddingTop: "100%" }} />
        </Box>
      ))}
    </Masonry>
  );

  if (error) return (
    <Zoom in><Alert severity="error" sx={{ mt: 2 }}>Error loading photos</Alert></Zoom>
  );

  if (!photos?.length) return (
    <Fade in>
      <Box textAlign="center" p={4}>
        <Typography variant="h6" gutterBottom color="text.secondary">This album is empty</Typography>
        <Button variant="contained" sx={{
                backgroundColor: "#0d7c73",
                color: "white",
                "&:hover": {
                  backgroundColor: "#0a635c",
                },
                "&:disabled": {
                  backgroundColor: "#b2dfdb",
                  color: "#e0f2f1",
                },
                "&:active": {
                  backgroundColor: "#084b45",
                  transform: "scale(0.98)",
                },
              }} startIcon={<AddPhotoAlternate />}onClick={(e) => {
                e.preventDefault();  // Add this
                e.stopPropagation(); 
                console.log("Button clicked - setting modal to true");
                setUploadModalOpen(true);
              }}>
          Add First Photo
        </Button>
      </Box>
    </Fade>
  );

  return (
    <Box sx={{ position: "relative", minHeight: "70vh" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} p={2}>
        <Typography variant="h6">{photos[0]?.albumTitle || "Album"} Photos</Typography>
        <Box display="flex" gap={1}>
          <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size="small">
            <ToggleButton value="grid">
              <Tooltip title="Grid view"><Box display="flex" alignItems="center" gap={0.5}>
                <ViewModule fontSize="small" />{!isMobile && "Grid"}
              </Box></Tooltip>
            </ToggleButton>
            <ToggleButton value="slideshow">
              <Tooltip title="Slideshow view"><Box display="flex" alignItems="center" gap={0.5}>
                <Slideshow fontSize="small" />{!isMobile && "Slideshow"}
              </Box></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          <Button variant="contained" onClick={() => setUploadModalOpen(true)} sx={{
                backgroundColor: "#0d7c73",
                color: "white",
                "&:hover": {
                  backgroundColor: "#0a635c",
                },
                "&:disabled": {
                  backgroundColor: "#b2dfdb",
                  color: "#e0f2f1",
                },
                "&:active": {
                  backgroundColor: "#084b45",
                  transform: "scale(0.98)",
                },
              }} startIcon={<AddPhotoAlternate />}>
            {!isMobile && "Add"}
          </Button>
        </Box>
      </Box>

      {!slideshowActive ? (
        <Masonry columns={{ xs: 2, sm: 3, md: 4, lg: 5 }} spacing={2}>
          {photos.map((photo, i) => (
            <Grow in timeout={(i % 10) * 100} key={photo.id}>
              <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", cursor: "pointer" }}
                onClick={() => { setCurrentSlideIndex(i); setSlideshowActive(true); }}>
                <Box sx={{ paddingTop: "100%", position: "relative" }}>
                  <Box component="img" src={photo.url} alt={photo.title} sx={{
                    position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover"
                  }} />
                </Box>
              </Box>
            </Grow>
          ))}
        </Masonry>
      ) : (
        <Box sx={{ width: "100%", height: fullscreen ? "100vh" : "70vh", position: "relative" }}>
          {controlsVisible && (
            <Box sx={{ position: "absolute", top: 16, left: 16, right: 16, zIndex: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="white">{currentSlideIndex + 1}/{photos.length}</Typography>
                <Box display="flex" gap={1}>
                  <IconButton onClick={() => setFullscreen(!fullscreen)} color="inherit" size="small">
                    {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                  <IconButton onClick={() => setZoomLevel(p => Math.min(p + 0.25, 3))} color="inherit" size="small">
                    <ZoomIn />
                  </IconButton>
                  <IconButton onClick={() => setZoomLevel(p => Math.max(p - 0.25, 0.5))} color="inherit" size="small">
                    <ZoomOut />
                  </IconButton>
                  <IconButton onClick={() => { setSlideshowActive(false); setFullscreen(false); }} color="inherit" size="small">
                    <Close />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
          <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setControlsVisible(!controlsVisible)}>
            <Box component="img" src={photos[currentSlideIndex]?.url} alt={photos[currentSlideIndex]?.title}
              sx={{ maxWidth: "100%", maxHeight: "90%", transform: `scale(${zoomLevel})`, cursor: zoomLevel > 1 ? "grab" : "pointer" }} />
          </Box>
        </Box>
      )}

      <PhotoUploadModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} albumId={albumId} />
    </Box>
  );
}