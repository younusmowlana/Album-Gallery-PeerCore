// components/AlbumList/AlbumList.tsx
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Avatar,
  ListItemAvatar,
  Skeleton,
  Typography
} from '@mui/material';
import { Album } from '../../types';
import { format } from 'date-fns';
import FolderIcon from '@mui/icons-material/Folder';

export default function AlbumList({ 
  albums, 
  viewType, 
  onSelect,
  isLoading, 
  album_id
}: { 
  albums: Album[]; 
  viewType: 'table' | 'folder'; 
  onSelect: (id: number) => void;
  isLoading?: boolean;
  album_id?: number;
}) {
  if (isLoading) {
    return (
      <div>
        {viewType === 'table' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3].map((row) => (
                  <TableRow key={row}>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <List>
            {[1, 2, 3].map((item) => (
              <ListItem key={item} disablePadding>
                <ListItemButton>
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Skeleton variant="text" />}
                    secondary={<Skeleton variant="text" />}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </div>
    );
  }

  if (!albums || albums.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No albums found. Create your first album!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      {viewType === 'table' ? (
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {albums.map((album) => (
                <TableRow 
                  key={album.id} 
                  hover 
                  onClick={() => onSelect(Number(album.id))}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{album.title}</TableCell>
                  <TableCell>{album.description || '-'}</TableCell>
                  <TableCell>{format(new Date(album.createdAt), 'MMM dd, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <List dense>
          {albums.map((album) => (
            <ListItem key={album.id} disablePadding>
              <ListItemButton onClick={() => onSelect(Number(album.id))}>
                <ListItemAvatar>
                  <Avatar>
                    <FolderIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={album.title} 
                  secondary={album.description || 'No description'} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}