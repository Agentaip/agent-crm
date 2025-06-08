import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ContentIdeasPage() {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState({
    idea_text: '',
    source: '',
    status: 'draft',
    intended_platform: 'all',
    created_by: ''
  });

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/content-ideas`);
      const data = await res.json();
      setIdeas(data);
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    }
  };

  const handleChange = (e) => {
    setNewIdea({ ...newIdea, [e.target.name]: e.target.value });
  };

  const handleAddIdea = async () => {
    if (!newIdea.idea_text) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/content-ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIdea)
      });
      if (res.ok) {
        setNewIdea({ idea_text: '', source: '', status: 'draft', intended_platform: 'all', created_by: '' });
        fetchIdeas();
      }
    } catch (err) {
      console.error('Error adding idea:', err);
    }
  };

  const handleDeleteIdea = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/content-ideas/${id}`, { method: 'DELETE' });
      fetchIdeas();
    } catch (err) {
      console.error('Error deleting idea:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Content Ideas</Typography>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Add New Idea</Typography>
        <TextField
          label="Idea Text"
          name="idea_text"
          fullWidth
          margin="normal"
          value={newIdea.idea_text}
          onChange={handleChange}
        />
        <TextField
          label="Source"
          name="source"
          fullWidth
          margin="normal"
          value={newIdea.source}
          onChange={handleChange}
        />
        <TextField
          label="Status"
          name="status"
          select
          fullWidth
          margin="normal"
          value={newIdea.status}
          onChange={handleChange}
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="used">Used</MenuItem>
        </TextField>
        <TextField
          label="Intended Platform"
          name="intended_platform"
          fullWidth
          margin="normal"
          value={newIdea.intended_platform}
          onChange={handleChange}
        />
        <TextField
          label="Created By"
          name="created_by"
          fullWidth
          margin="normal"
          value={newIdea.created_by}
          onChange={handleChange}
        />
        <Button variant="contained" onClick={handleAddIdea}>Add Idea</Button>
      </Paper>

      <Typography variant="h6" gutterBottom>All Ideas</Typography>
      <List>
        {ideas.map((idea) => (
          <React.Fragment key={idea.id}>
            <ListItem>
              <ListItemText
                primary={idea.idea_text}
                secondary={`Source: ${idea.source || 'N/A'} | Platform: ${idea.intended_platform || 'all'} | Status: ${idea.status}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDeleteIdea(idea.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
