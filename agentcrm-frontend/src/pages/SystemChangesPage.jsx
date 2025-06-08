import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Button, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const STATUS_OPTIONS = ['draft', 'under_review', 'approved', 'executed'];

function SystemChangesPage() {
  const [changes, setChanges] = useState([]);
  const [newChange, setNewChange] = useState({
    reason: '',
    affected_agents: '',
    proposed_structure: '',
    impact_risks: '',
    testing_plan: '',
    status: 'draft',
    approved_by: '',
    version: ''
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    api.get('/system-changes')
      .then(res => setChanges(res.data || []))
      .catch(err => console.error('Error loading system changes:', err));
  }, []);

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditData(prev => ({ ...prev, [name]: value }));
    } else {
      setNewChange(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAdd = () => {
    api.post('/system-changes', newChange)
      .then(res => {
        setChanges(prev => [{ id: res.data.id, ...newChange }, ...prev]);
        setNewChange({
          reason: '',
          affected_agents: '',
          proposed_structure: '',
          impact_risks: '',
          testing_plan: '',
          status: 'draft',
          approved_by: '',
          version: ''
        });
      })
      .catch(err => console.error('Error adding change:', err));
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setEditData({ ...row });
  };

  const handleEditSave = () => {
    api.put(`/system-changes/${editId}`, editData)
      .then(() => {
        setChanges(prev =>
          prev.map(d => (d.id === editId ? { ...d, ...editData } : d))
        );
        setEditId(null);
        setEditData({});
      })
      .catch(err => console.error('Error updating change:', err));
  };

  const handleDelete = (id) => {
    api.delete(`/system-changes/${id}`)
      .then(() => {
        setChanges(prev => prev.filter(d => d.id !== id));
      })
      .catch(err => console.error('Error deleting change:', err));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>System Changes</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New Change</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Reason" name="reason" value={newChange.reason} onChange={handleChange} fullWidth />
          <TextField label="Affected Agents (JSON/Text)" name="affected_agents" value={newChange.affected_agents} onChange={handleChange} fullWidth />
          <TextField label="Proposed Structure" name="proposed_structure" value={newChange.proposed_structure} onChange={handleChange} fullWidth />
          <TextField label="Impact Risks" name="impact_risks" value={newChange.impact_risks} onChange={handleChange} fullWidth />
          <TextField label="Testing Plan" name="testing_plan" value={newChange.testing_plan} onChange={handleChange} fullWidth />
          <Select name="status" value={newChange.status} onChange={handleChange}>
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField label="Approved By" name="approved_by" value={newChange.approved_by} onChange={handleChange} />
          <TextField label="Version" name="version" value={newChange.version} onChange={handleChange} />
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Approved By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changes.map(row => (
              <TableRow key={row.id}>
                {editId === row.id ? (
                  <>
                    <TableCell><TextField name="version" value={editData.version} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><TextField name="reason" value={editData.reason} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell>
                      <Select name="status" value={editData.status} onChange={(e) => handleChange(e, true)}>
                        {STATUS_OPTIONS.map(opt => (
                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell><TextField name="approved_by" value={editData.approved_by} onChange={(e) => handleChange(e, true)} /></TableCell>
                    <TableCell><Button onClick={handleEditSave}>Save</Button></TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{row.version}</TableCell>
                    <TableCell>{row.reason}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.approved_by}</TableCell>
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

export default SystemChangesPage;
