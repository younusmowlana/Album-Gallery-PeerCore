// components/PhotoUploadModal/PhotoUploadModal.tsx
import { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadPhoto } from "../../api/photos";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  file: z.any().refine((file) => file, "File is required"),
});

type FormData = z.infer<typeof schema>;

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 1,
};

export default function PhotoUploadModal({
  open,
  onClose,
  albumId,
}: {
  open: boolean;
  onClose: () => void;
  albumId: number;
}) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const file = watch("file");

  // In the mutation part of PhotoUploadModal, update the onSuccess handler:
  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("file", data.file);
      formData.append("albumId", albumId.toString());
      return uploadPhoto(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos", albumId] });
      handleClose();
    },
    onError: (error) => {
      console.error("Upload error:", error);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue("file", file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    reset();
    setPreview(null);
    onClose();
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Upload Photo</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {mutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error uploading photo. Please try again.
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Photo Title"
            fullWidth
            {...register("title")}
            error={!!errors.title}
            helperText={errors.title?.message}
            disabled={mutation.isLoading}
          />

          <Box
            sx={{
              border: "1px dashed",
              borderColor: errors.file ? "error.main" : "divider",
              borderRadius: 1,
              p: 2,
              textAlign: "center",
              backgroundColor: "action.hover",
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 200,
                  marginBottom: 16,
                }}
              />
            ) : (
              <CloudUploadIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
              />
            )}

            <Button
              variant="contained"
              component="label"
              disabled={mutation.isLoading}
              sx={{
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
              }}
            >
              Select File
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>

            {errors.file && (
              <Typography color="error" variant="body2" mt={1}>
                {errors.file.message}
              </Typography>
            )}
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
            <Button
              onClick={handleClose}
              disabled={mutation.isLoading}
              variant="outlined"
              sx={{
                color: "#0d7c73",
                borderColor: "#0d7c73",
                "&:hover": {
                  backgroundColor: "rgba(13, 124, 115, 0.08)", // subtle hover effect
                  borderColor: "#0a635c",
                  color: "#0a635c",
                },
                "&:disabled": {
                  color: "#b2dfdb",
                  borderColor: "#b2dfdb",
                },
                "&:active": {
                  backgroundColor: "rgba(13, 124, 115, 0.12)",
                  borderColor: "#084b45",
                  color: "#084b45",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isLoading || !file}
              startIcon={
                mutation.isLoading ? <CircularProgress size={20} /> : null
              }
              sx={{
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
              }}
            >
              Upload
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
