import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Grid
} from '@mui/material';

const defaultForm = {
  source_post_id: '',
  platform: '',
  remix_type: '',
  title: '',
  content_text: '',
  media_link: '',
  created_at: '',
  notes: ''
};

const ContentRemixesPage = () => {
  const [remixes, setRemixes] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRemixes();
  }, []);

  const fetchRemixes = async () => {
    try {
      const res = await axios.get('/content-remixes');
      setRemixes(res.data);
    } catch (error) {
      console.error('Failed to fetch remixes:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/content-remixes/${editingId}`, form);
      } else {
        await axios.post('/content-remixes', form);
      }
      setForm(defaultForm);
      setEditingId(null);
      fetchRemixes();
    } catch (error) {
      console.error('Failed to save remix:', error);
    }
  };

  const handleEdit = (remix) => {
    setForm({ ...remix });
    setEditingId(remix.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this remix?')) return;
    try {
      await axios.delete(`/content-remixes/${id}`);
      fetchRemixes();
    } catch (error) {
      console.error('Failed to delete remix:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>🎛️ Content Remixes</Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Source Post ID"
              name="source_post_id"
              value={form.source_post_id}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Platform"
              name="platform"
              value={form.platform}
              onChange={handleChange}
              placeholder="e.g. instagram"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Remix Type"
              name="remix_type"
              value={form.remix_type}
              onChange={handleChange}
              placeholder="e.g. reel"
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Content Text"
              name="content_text"
              value={form.content_text}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Media Link"
              name="media_link"
              value={form.media_link}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Created At"
              name="created_at"
              type="datetime-local"
              value={form.created_at}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          {editingId ? 'Update' : 'Create'} Remix
        </Button>
      </form>

      <Paper sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Source Post</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Media</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {remixes.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.source_post_id}</TableCell>
                <TableCell>{r.platform}</TableCell>
                <TableCell>{r.remix_type}</TableCell>
                <TableCell>{r.title}</TableCell>
                <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                <TableCell><a href={r.media_link} target="_blank" rel="noreferrer">📎</a></TableCell>
                <TableCell>{r.notes}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(r)}>✏️</Button>
                  <Button onClick={() => handleDelete(r.id)} color="error">🗑️</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default ContentRemixesPage;
