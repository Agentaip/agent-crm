import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Button, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const RATINGS = ['positive', 'neutral', 'negative'];

function ContentFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    post_id: '',
    client_id: '',
    feedback_text: '',
    rating: 'neutral'
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    api.get('/content-feedback')
      .then(res => setFeedbacks(res.data || []))
      .catch(err => console.error('Error loading feedbacks:', err));
  }, []);

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditData(prev => ({ ...prev, [name]: value }));
    } else {
      setNewFeedback(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAdd = () => {
    api.post('/content-feedback', newFeedback)
      .then(res => {
        setFeedbacks(prev => [{ id: res.data.id, ...newFeedback }, ...prev]);
        setNewFeedback({
          post_id: '',
          client_id: '',
          feedback_text: '',
          rating: 'neutral'
        });
      })
      .catch(err => console.error('Error adding feedback:', err));
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setEditData({ ...row });
  };

  const handleEditSave = () => {
    api.put(`/content-feedback/${editId}`, editData)
      .then(() => {
        setFeedbacks(prev =>
          prev.map(f => (f.id === editId ? { ...f, ...editData } : f))
        );
        setEditId(null);
        setEditData({});
      })
      .catch(err => console.error('Error updating feedback:', err));
  };

  const handleDelete = (id) => {
    api.delete(`/content-feedback/${id}`)
      .then(() => {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
      })
      .catch(err => console.error('Error deleting feedback:', err));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Content Feedback</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New Feedback</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Post ID"
            name="post_id"
            value={newFeedback.post_id}
            onChange={handleChange}
          />
          <TextField
            label="Client ID"
            name="client_id"
            value={newFeedback.client_id}
            onChange={handleChange}
          />
          <TextField
            label="Feedback Text"
            name="feedback_text"
            value={newFeedback.feedback_text}
            onChange={handleChange}
          />
          <Select
            name="rating"
            value={newFeedback.rating}
            onChange={handleChange}
          >
            {RATINGS.map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Post ID</TableCell>
              <TableCell>Client ID</TableCell>
              <TableCell>Feedback</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.map(row => (
              <TableRow key={row.id}>
                {editId === row.id ? (
                  <>
                    <TableCell>
                      <TextField name="post_id" value={editData.post_id} onChange={(e) => handleChange(e, true)} />
                    </TableCell>
                    <TableCell>
                      <TextField name="client_id" value={editData.client_id} onChange={(e) => handleChange(e, true)} />
                    </TableCell>
                    <TableCell>
                      <TextField name="feedback_text" value={editData.feedback_text} onChange={(e) => handleChange(e, true)} />
                    </TableCell>
                    <TableCell>
                      <Select name="rating" value={editData.rating} onChange={(e) => handleChange(e, true)}>
                        {RATINGS.map(r => (
                          <MenuItem key={r} value={r}>{r}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button onClick={handleEditSave}>Save</Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{row.post_id}</TableCell>
                    <TableCell>{row.client_id}</TableCell>
                    <TableCell>{row.feedback_text}</TableCell>
                    <TableCell>{row.rating}</TableCell>
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

export default ContentFeedbackPage;
