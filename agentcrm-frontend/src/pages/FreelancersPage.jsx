import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Button, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const SKILL_OPTIONS = ['GPT', 'Make', 'UI', 'QA', 'Voice', 'Integration', 'Design'];

function FreelancersPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('');
  const [newFreelancer, setNewFreelancer] = useState({
    name: '',
    skill: 'GPT',
    contact_email: '',
    whatsapp: '',
    is_available: true,
    current_load: 0,
    rating: 0,
    notes: ''
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    api.get('/freelancers')
      .then(res => {
        setFreelancers(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading freelancers:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewFreelancer(prev => ({
      ...prev,
      [name]: name === 'is_available' ? value === 'true' : value
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: name === 'is_available' ? value === 'true' : value
    }));
  };

  const handleAdd = () => {
    api.post('/freelancers', newFreelancer)
      .then(res => {
        setFreelancers(prev => [{ id: res.data.id, ...newFreelancer }, ...prev]);
        setNewFreelancer({
          name: '',
          skill: 'GPT',
          contact_email: '',
          whatsapp: '',
          is_available: true,
          current_load: 0,
          rating: 0,
          notes: ''
        });
      })
      .catch(err => {
        console.error('Error adding freelancer:', err);
      });
  };

  const handleEdit = (freelancer) => {
    setEditId(freelancer.id);
    setEditData({ ...freelancer });
  };

  const handleEditSave = () => {
    api.put(`/freelancers/${editId}`, editData)
      .then(() => {
        setFreelancers(prev =>
          prev.map(f => (f.id === editId ? { ...f, ...editData } : f))
        );
        setEditId(null);
        setEditData({});
      })
      .catch(err => {
        console.error('Error updating freelancer:', err);
      });
  };

  const handleDelete = (id) => {
    api.delete(`/freelancers/${id}`)
      .then(() => {
        setFreelancers(prev => prev.filter(f => f.id !== id));
      })
      .catch(err => {
        console.error('Error deleting freelancer:', err);
      });
  };

  const filtered = freelancers.filter(f => !skillFilter || f.skill === skillFilter);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Freelancers</Typography>

      {/* סינון לפי התמחות */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Skills</MenuItem>
          {SKILL_OPTIONS.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* טופס הוספה */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New Freelancer</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Name" name="name" value={newFreelancer.name} onChange={handleChange} />
          <Select name="skill" value={newFreelancer.skill} onChange={handleChange}>
            {SKILL_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField label="Email" name="contact_email" value={newFreelancer.contact_email} onChange={handleChange} />
          <TextField label="WhatsApp" name="whatsapp" value={newFreelancer.whatsapp} onChange={handleChange} />
          <Select name="is_available" value={newFreelancer.is_available.toString()} onChange={handleChange}>
            <MenuItem value="true">Available</MenuItem>
            <MenuItem value="false">Unavailable</MenuItem>
          </Select>
          <TextField label="Current Load" name="current_load" type="number" value={newFreelancer.current_load} onChange={handleChange} />
          <TextField label="Rating" name="rating" type="number" value={newFreelancer.rating} onChange={handleChange} />
          <TextField label="Notes" name="notes" value={newFreelancer.notes} onChange={handleChange} />
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      {/* טבלה */}
      {loading ? (
        <Typography>Loading freelancers...</Typography>
      ) : (
        <Paper>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Skill</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>WhatsApp</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Load</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id}>
                  {editId === f.id ? (
                    <>
                      <TableCell><TextField name="name" value={editData.name} onChange={handleEditChange} /></TableCell>
                      <TableCell>
                        <Select name="skill" value={editData.skill} onChange={handleEditChange}>
                          {SKILL_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell><TextField name="contact_email" value={editData.contact_email} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="whatsapp" value={editData.whatsapp} onChange={handleEditChange} /></TableCell>
                      <TableCell>
                        <Select name="is_available" value={editData.is_available.toString()} onChange={handleEditChange}>
                          <MenuItem value="true">Available</MenuItem>
                          <MenuItem value="false">Unavailable</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell><TextField name="current_load" type="number" value={editData.current_load} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="rating" type="number" value={editData.rating} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="notes" value={editData.notes} onChange={handleEditChange} /></TableCell>
                      <TableCell><Button onClick={handleEditSave}>Save</Button></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{f.name}</TableCell>
                      <TableCell>{f.skill}</TableCell>
                      <TableCell>{f.contact_email}</TableCell>
                      <TableCell>{f.whatsapp}</TableCell>
                      <TableCell>{f.is_available ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{f.current_load}</TableCell>
                      <TableCell>{f.rating}</TableCell>
                      <TableCell>{f.notes}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(f)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(f.id)}><DeleteIcon /></IconButton>
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

export default FreelancersPage;
