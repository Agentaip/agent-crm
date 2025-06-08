import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Button, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const FOLLOWUP_OPTIONS = ['ממתין', 'הושלם', 'לקוח לא ענה', 'דורש תמיכה'];

function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [newDelivery, setNewDelivery] = useState({
    project_id: '',
    delivery_link: '',
    delivered_at: '',
    delivered_by: '',
    followup_status: 'ממתין',
    feedback: '',
    notes: ''
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    api.get('/deliveries')
      .then(res => setDeliveries(res.data || []))
      .catch(err => console.error('Error loading deliveries:', err));
  }, []);

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditData(prev => ({ ...prev, [name]: value }));
    } else {
      setNewDelivery(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAdd = () => {
    api.post('/deliveries', newDelivery)
      .then(res => {
        setDeliveries(prev => [{ id: res.data.id, ...newDelivery }, ...prev]);
        setNewDelivery({
          project_id: '',
          delivery_link: '',
          delivered_at: '',
          delivered_by: '',
          followup_status: 'ממתין',
          feedback: '',
          notes: ''
        });
      })
      .catch(err => console.error('Error adding delivery:', err));
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setEditData({ ...row });
  };

  const handleEditSave = () => {
    api.put(`/deliveries/${editId}`, editData)
      .then(() => {
        setDeliveries(prev =>
          prev.map(d => (d.id === editId ? { ...d, ...editData } : d))
        );
        setEditId(null);
        setEditData({});
      })
      .catch(err => console.error('Error updating delivery:', err));
  };

  const handleDelete = (id) => {
    api.delete(`/deliveries/${id}`)
      .then(() => {
        setDeliveries(prev => prev.filter(d => d.id !== id));
      })
      .catch(err => console.error('Error deleting delivery:', err));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Deliveries</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New Delivery</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Project ID"
            name="project_id"
            value={newDelivery.project_id}
            onChange={handleChange}
          />
          <TextField
            label="Delivery Link"
            name="delivery_link"
            value={newDelivery.delivery_link}
            onChange={handleChange}
          />
          <TextField
            label="Delivered At"
            name="delivered_at"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={newDelivery.delivered_at}
            onChange={handleChange}
          />
          <TextField
            label="Delivered By"
            name="delivered_by"
            value={newDelivery.delivered_by}
            onChange={handleChange}
          />
          <Select
            name="followup_status"
            value={newDelivery.followup_status}
            onChange={handleChange}
          >
            {FOLLOWUP_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Feedback"
            name="feedback"
            value={newDelivery.feedback}
            onChange={handleChange}
          />
          <TextField
            label="Notes"
            name="notes"
            value={newDelivery.notes}
            onChange={handleChange}
          />
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Project ID</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Delivered At</TableCell>
              <TableCell>By</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Feedback</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveries.map(row => (
              <TableRow key={row.id}>
                {editId === row.id ? (
                  <>
                    <TableCell><TextField name="project_id" value={editData.project_id} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><TextField name="delivery_link" value={editData.delivery_link} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><TextField type="datetime-local" name="delivered_at" value={editData.delivered_at} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><TextField name="delivered_by" value={editData.delivered_by} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell>
                      <Select name="followup_status" value={editData.followup_status} onChange={(e) => handleChange(e, true)}>
                        {FOLLOWUP_OPTIONS.map(opt => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell><TextField name="feedback" value={editData.feedback} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><TextField name="notes" value={editData.notes} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><Button onClick={handleEditSave}>Save</Button></TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{row.project_id}</TableCell>
                    <TableCell>{row.delivery_link}</TableCell>
                    <TableCell>{row.delivered_at}</TableCell>
                    <TableCell>{row.delivered_by}</TableCell>
                    <TableCell>{row.followup_status}</TableCell>
                    <TableCell>{row.feedback}</TableCell>
                    <TableCell>{row.notes}</TableCell>
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

export default DeliveriesPage;
