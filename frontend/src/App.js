import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Description as DocIcon,
  Code as CodeIcon,
  TextSnippet as TextIcon,
  InsertChart as CsvIcon,
  DataObject as JsonIcon
} from '@mui/icons-material';
import FileUpload from './components/FileUpload';
import api from './services/api';

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const allFiles = files;

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.listFiles();
      setFiles(response);
    } catch (err) {
      setError('Error fetching files. Please try again.');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.deleteFile(id);
      await fetchFiles();
    } catch (err) {
      setError('Error deleting file. Please try again.');
      console.error('Error deleting file:', err);
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const blob = await api.downloadFile(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Error downloading file. Please try again.');
      console.error('Error downloading file:', err);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      py: 4,
      px: 2,
      backgroundColor: 'transparent'
    }}>
      <Container 
        maxWidth="md" 
        sx={{
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          p: 4,
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ 
            fontWeight: 'bold',
            color: '#0061FF',
            mb: 4,
            textShadow: '2px 2px 4px rgba(0, 97, 255, 0.1)'
          }}
        >
          DROPBOX
        </Typography>

        <Box sx={{ 
          backgroundColor: 'rgba(245, 249, 255, 0.7)', 
          borderRadius: 1,
          p: 3,
          mb: 4,
          border: '2px dashed rgba(0, 97, 255, 0.2)'
        }}>
          <FileUpload onUploadComplete={fetchFiles} />
        </Box>

        {error && (
          <Box sx={{ my: 2 }}>
            <Paper 
              sx={{ 
                p: 2, 
                backgroundColor: '#FFF3F3',
                color: '#D32F2F',
                border: '1px solid #FFA4A4'
              }}
            >
              {error}
            </Paper>
          </Box>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress sx={{ color: '#0061FF' }} />
          </Box>
        ) : (
          <>

            {/* Other Files Section (always visible) */}
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3,
                  color: '#1E1919',
                  fontWeight: 600,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    width: '60px',
                    height: '3px',
                    backgroundColor: '#0061FF',
                    borderRadius: '2px'
                  }
                }}
              >
                Files
              </Typography>
              {allFiles.length > 0 ? (
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F5F9FF' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allFiles.map((file) => {
                        // Determine icon by file type
                        const fname = file.original_name || file.name || '';
                        const ext = fname.split('.').pop().toLowerCase();
                        let icon = <FileIcon sx={{ color: '#90A4AE', mr: 1 }} />;
                        if (file.content_type && file.content_type.startsWith('image/')) {
                          icon = <ImageIcon sx={{ color: '#42A5F5', mr: 1 }} />;
                        } else if (ext === 'pdf') {
                          icon = <PdfIcon sx={{ color: '#E53935', mr: 1 }} />;
                        } else if (ext === 'json') {
                          icon = <JsonIcon sx={{ color: '#F9A825', mr: 1 }} />;
                        } else if (ext === 'csv') {
                          icon = <CsvIcon sx={{ color: '#43A047', mr: 1 }} />;
                        } else if (ext === 'txt') {
                          icon = <TextIcon sx={{ color: '#616161', mr: 1 }} />;
                        } else if (['doc', 'docx'].includes(ext)) {
                          icon = <DocIcon sx={{ color: '#1976D2', mr: 1 }} />;
                        } else if (['js', 'py', 'java', 'cpp', 'c', 'ts'].includes(ext)) {
                          icon = <CodeIcon sx={{ color: '#7B1FA2', mr: 1 }} />;
                        }
                        return (
                          <TableRow 
                            key={file.id}
                            sx={{ '&:hover': { backgroundColor: '#F5F9FF' } }}
                          >
                            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                              {icon}
                              {fname || 'Untitled'}
                            </TableCell>
                            <TableCell>{formatDate(file.uploaded_at)}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={() => window.open(`http://localhost:8000/api/files/${file.id}/preview/`, '_blank')}
                                title="Preview"
                                sx={{ color: '#0061FF' }}
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDownload(file.id, fname || 'Untitled')}
                                title="Download"
                                sx={{ color: '#00A82D' }}
                              >
                                <DownloadIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDelete(file.id)}
                                title="Delete"
                                sx={{ color: '#FF4D4F' }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ fontStyle: 'italic', mb: 2 }}>
                  No files uploaded
                </Typography>
              )}
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}

export default App;