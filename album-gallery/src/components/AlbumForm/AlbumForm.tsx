// components/AlbumForm/AlbumForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, TextField, Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAlbum } from '../../api/albums';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
});

type FormData = z.infer<typeof schema>;

export default function AlbumForm({ onCancel }: { onCancel: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: createAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries(['albums']);
      onCancel();
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Create New Album
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            {...register('title')}
            error={!!errors.title}
            helperText={errors.title?.message}
            disabled={mutation.isLoading}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
            disabled={mutation.isLoading}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button 
              onClick={onCancel} 
              disabled={mutation.isLoading}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={mutation.isLoading}
              startIcon={mutation.isLoading ? <CircularProgress size={20} /> : null}
            >
              {mutation.isLoading ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}