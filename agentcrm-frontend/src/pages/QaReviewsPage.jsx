import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Button, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const STATUS_OPTIONS = ['approved', 'rejected'];

function QaReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const [newReview, setNewReview] = useState({
    project_id: '',
    reviewer: '',
    status: 'approved',
    notes: '',
    approved_at: '',
    created_at: ''
  });

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    api.get('/qa-reviews')
      .then(res => {
        setReviews(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading QA reviews:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    api.post('/qa-reviews', newReview)
      .then(res => {
        setReviews(prev => [{ id: res.data.id, ...newReview }, ...prev]);
        setNewReview({
          project_id: '',
          reviewer: '',
          status: 'approved',
          notes: '',
          approved_at: '',
          created_at: ''
        });
      })
      .catch(err => {
        console.error('Error adding QA review:', err);
      });
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditData({ ...item });
  };

  const handleEditSave = () => {
    api.put(`/qa-reviews/${editId}`, editData)
      .then(() => {
        setReviews(prev => prev.map(p => (p.id === editId ? { ...p, ...editData } : p)));
        setEditId(null);
        setEditData({});
      })
      .catch(err => {
        console.error('Error updating QA review:', err);
      });
  };

  const handleDelete = (id) => {
    api.delete(`/qa-reviews/${id}`)
      .then(() => {
        setReviews(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => {
        console.error('Error deleting QA review:', err);
      });
  };

  const filtered = reviews.filter(r => !statusFilter || r.status === statusFilter);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>QA Reviews</Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All</MenuItem>
          {STATUS_OPTIONS.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New QA Review</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Project ID"
            name="project_id"
            value={newReview.project_id}
            onChange={handleChange}
          />
          <TextField
            label="Reviewer"
            name="reviewer"
            value={newReview.reviewer}
            onChange={handleChange}
          />
          <Select name="status" value={newReview.status} onChange={handleChange}>
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Approved At"
            name="approved_at"
            type="datetime-local"
            value={newReview.approved_at}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Notes"
            name="notes"
            value={newReview.notes}
            onChange={handleChange}
            fullWidth
          />
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      {/* Table */}
      {loading ? (
        <Typography>Loading QA reviews...</Typography>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project ID</TableCell>
                <TableCell>Reviewer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Approved At</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  {editId === r.id ? (
                    <>
                      <TableCell><TextField name="project_id" value={editData.project_id} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="reviewer" value={editData.reviewer} onChange={handleEditChange} /></TableCell>
                      <TableCell>
                        <Select name="status" value={editData.status} onChange={handleEditChange}>
                          {STATUS_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField name="approved_at" type="datetime-local" value={editData.approved_at} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
                      </TableCell>
                      <TableCell><TextField name="notes" value={editData.notes} onChange={handleEditChange} /></TableCell>
                      <TableCell><Button onClick={handleEditSave}>Save</Button></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{r.project_id}</TableCell>
                      <TableCell>{r.reviewer}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{r.approved_at}</TableCell>
                      <TableCell>{r.notes}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(r)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(r.id)}><DeleteIcon /></IconButton>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}

export default QaReviewsPage;
