import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Button, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const STATUS_OPTIONS = ['assigned', 'in_progress', 'late', 'done', 'cancelled'];

function ProjectAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAssignment, setNewAssignment] = useState({
    project_id: '',
    freelancer_id: '',
    assigned_at: '',
    due_date: '',
    status: 'assigned',
    delivery_link: '',
    notes: ''
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/project-assignments')
      .then(res => {
        setAssignments(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading assignments:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    api.post('/project-assignments', newAssignment)
      .then(res => {
        setAssignments(prev => [{ id: res.data.id, ...newAssignment }, ...prev]);
        setNewAssignment({
          project_id: '',
          freelancer_id: '',
          assigned_at: '',
          due_date: '',
          status: 'assigned',
          delivery_link: '',
          notes: ''
        });
      })
      .catch(err => {
        console.error('Error adding assignment:', err);
      });
  };

  const handleEdit = (assignment) => {
    setEditId(assignment.id);
    setEditData({ ...assignment });
  };

  const handleEditSave = () => {
    api.put(`/project-assignments/${editId}`, editData)
      .then(() => {
        setAssignments(prev => prev.map(a => (a.id === editId ? { ...a, ...editData } : a)));
        setEditId(null);
        setEditData({});
      })
      .catch(err => {
        console.error('Error updating assignment:', err);
      });
  };

  const handleDelete = (id) => {
    api.delete(`/project-assignments/${id}`)
      .then(() => {
        setAssignments(prev => prev.filter(a => a.id !== id));
      })
      .catch(err => {
        console.error('Error deleting assignment:', err);
      });
  };

  const filtered = assignments.filter(a => !statusFilter || a.status === statusFilter);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Project Assignments</Typography>

      {/* סינון */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Statuses</MenuItem>
          {STATUS_OPTIONS.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* טופס הוספה */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add Assignment</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Project ID" name="project_id" value={newAssignment.project_id} onChange={handleChange} />
          <TextField label="Freelancer ID" name="freelancer_id" value={newAssignment.freelancer_id} onChange={handleChange} />
          <TextField label="Assigned At" type="datetime-local" name="assigned_at" value={newAssignment.assigned_at} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Due Date" type="date" name="due_date" value={newAssignment.due_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <Select name="status" value={newAssignment.status} onChange={handleChange}>
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField label="Delivery Link" name="delivery_link" value={newAssignment.delivery_link} onChange={handleChange} />
          <TextField label="Notes" name="notes" value={newAssignment.notes} onChange={handleChange} />
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      {/* טבלה */}
      {loading ? (
        <Typography>Loading assignments...</Typography>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project ID</TableCell>
                <TableCell>Freelancer ID</TableCell>
                <TableCell>Assigned At</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Delivery</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  {editId === a.id ? (
                    <>
                      <TableCell><TextField name="project_id" value={editData.project_id} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="freelancer_id" value={editData.freelancer_id} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField type="datetime-local" name="assigned_at" value={editData.assigned_at} onChange={handleEditChange} InputLabelProps={{ shrink: true }} /></TableCell>
                      <TableCell><TextField type="date" name="due_date" value={editData.due_date} onChange={handleEditChange} InputLabelProps={{ shrink: true }} /></TableCell>
                      <TableCell>
                        <Select name="status" value={editData.status} onChange={handleEditChange}>
                          {STATUS_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell><TextField name="delivery_link" value={editData.delivery_link} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="notes" value={editData.notes} onChange={handleEditChange} /></TableCell>
                      <TableCell>
                        <Button onClick={handleEditSave}>Save</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{a.project_id}</TableCell>
                      <TableCell>{a.freelancer_id}</TableCell>
                      <TableCell>{a.assigned_at}</TableCell>
                      <TableCell>{a.due_date}</TableCell>
                      <TableCell>{a.status}</TableCell>
                      <TableCell>{a.delivery_link}</TableCell>
                      <TableCell>{a.notes}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(a)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(a.id)}><DeleteIcon /></IconButton>
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

export default ProjectAssignmentsPage;
