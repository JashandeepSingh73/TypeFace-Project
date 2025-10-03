import { useState } from 'react';
import { Box, Button, LinearProgress, Typography, Paper, IconButton } from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Clear as ClearIcon,
  InsertDriveFile as FileIcon 
} from '@mui/icons-material';
import api from '../services/api';

function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function FileUpload({ onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      await api.uploadFile(selectedFile);
      onUploadComplete();
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.response?.data?.file?.[0] || 'Error uploading file');
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setError(null);
    // Reset the file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

  return (
    <Box sx={{ maxWidth: 300, mx: 'auto', textAlign: 'center', py: 1 }}>
      {!selectedFile ? (
        <Box sx={{ px: 0, py: 0 }}>
          <input
            type="file"
            id="fileInput"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            htmlFor="fileInput"
            disabled={uploading}
            sx={{
              backgroundColor: '#0061FF',
              fontSize: '0.95rem',
              px: 2.5,
              py: 1,
              minWidth: 0,
              minHeight: 0,
              lineHeight: 1.2,
              '&:hover': {
                backgroundColor: '#0056E0'
              }
            }}
          >
            Choose File
          </Button>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 1, fontSize: '0.85rem' }}
          >
            or drag and drop a file here
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', backgroundColor: '#F5F9FF', borderRadius: 1, p: 2, mb: 2 }}>
          <FileIcon sx={{ mr: 2, color: '#0061FF' }} />
          <Box sx={{ flexGrow: 1, textAlign: 'left', minWidth: 0 }}>
            <Typography 
              variant="subtitle2" 
              component="div" 
              sx={{ color: '#1E1919', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {selectedFile.name}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
            >
              {formatSize(selectedFile.size)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleUpload}
            disabled={uploading}
            sx={{
              backgroundColor: '#00A82D',
              ml: 2,
              minWidth: 0,
              px: 2,
              '&:hover': { backgroundColor: '#009728' }
            }}
          >
            Upload
          </Button>
          <IconButton 
            onClick={clearSelectedFile}
            size="small"
            sx={{ color: '#FF4D4F', ml: 1 }}
          >
            <ClearIcon />
          </IconButton>
        </Box>
      )}
      <Box sx={{ mt: 0.01 }}>
        {uploading && <LinearProgress sx={{ mb: 1 }} />}
        {error && (
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
        )}
      </Box>
    </Box>
  );
}

export default FileUpload;