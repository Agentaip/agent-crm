import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Button, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const PLATFORMS = ['instagram', 'facebook', 'linkedin', 'tiktok', 'blog', 'email'];
const POST_TYPES = ['story', 'reel', 'post', 'article', 'email', 'ad'];

function ContentPostsPage() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    platform: '',
    post_type: '',
    title: '',
    content_text: '',
    media_link: '',
    cta_text: '',
    posted_at: '',
    created_by: '',
    related_campaign_id: '',
    notes: ''
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    api.get('/content-posts')
      .then(res => setPosts(res.data || []))
      .catch(err => console.error('Error loading posts:', err));
  }, []);

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditData(prev => ({ ...prev, [name]: value }));
    } else {
      setNewPost(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAdd = () => {
    api.post('/content-posts', newPost)
      .then(res => {
        setPosts(prev => [{ id: res.data.id, ...newPost }, ...prev]);
        setNewPost({
          platform: '', post_type: '', title: '', content_text: '', media_link: '',
          cta_text: '', posted_at: '', created_by: '', related_campaign_id: '', notes: ''
        });
      })
      .catch(err => console.error('Error adding post:', err));
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setEditData({ ...row });
  };

  const handleEditSave = () => {
    api.put(`/content-posts/${editId}`, editData)
      .then(() => {
        setPosts(prev => prev.map(p => (p.id === editId ? { ...p, ...editData } : p)));
        setEditId(null);
        setEditData({});
      })
      .catch(err => console.error('Error updating post:', err));
  };

  const handleDelete = (id) => {
    api.delete(`/content-posts/${id}`)
      .then(() => {
        setPosts(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => console.error('Error deleting post:', err));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Content Posts</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New Post</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Select name="platform" value={newPost.platform} onChange={handleChange} displayEmpty>
            <MenuItem value="" disabled>Select Platform</MenuItem>
            {PLATFORMS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
          <Select name="post_type" value={newPost.post_type} onChange={handleChange} displayEmpty>
            <MenuItem value="" disabled>Select Type</MenuItem>
            {POST_TYPES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
          <TextField name="title" label="Title" value={newPost.title} onChange={handleChange} />
          <TextField name="content_text" label="Content" value={newPost.content_text} onChange={handleChange} />
          <TextField name="media_link" label="Media Link" value={newPost.media_link} onChange={handleChange} />
          <TextField name="cta_text" label="CTA" value={newPost.cta_text} onChange={handleChange} />
          <TextField name="posted_at" label="Posted At" type="datetime-local" InputLabelProps={{ shrink: true }} value={newPost.posted_at} onChange={handleChange} />
          <TextField name="created_by" label="Created By" value={newPost.created_by} onChange={handleChange} />
          <TextField name="related_campaign_id" label="Campaign ID" value={newPost.related_campaign_id} onChange={handleChange} />
          <TextField name="notes" label="Notes" value={newPost.notes} onChange={handleChange} />
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Platform</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Posted At</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map(row => (
              <TableRow key={row.id}>
                {editId === row.id ? (
                  <>
                    <TableCell><Select name="platform" value={editData.platform} onChange={(e) => handleChange(e, true)}>{PLATFORMS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}</Select></TableCell>
                    <TableCell><Select name="post_type" value={editData.post_type} onChange={(e) => handleChange(e, true)}>{POST_TYPES.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}</Select></TableCell>
                    <TableCell><TextField name="title" value={editData.title} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><TextField name="posted_at" type="datetime-local" value={editData.posted_at} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><TextField name="created_by" value={editData.created_by} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><Button onClick={handleEditSave}>Save</Button></TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{row.platform}</TableCell>
                    <TableCell>{row.post_type}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.posted_at}</TableCell>
                    <TableCell>{row.created_by}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(row)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(row.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default ContentPostsPage;
