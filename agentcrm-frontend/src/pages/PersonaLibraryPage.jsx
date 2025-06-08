import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, Chip,
  Select, MenuItem, FormControl, OutlinedInput, Checkbox, ListItemText
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const toneOptions = ['funny', 'serious', 'technical', 'friendly'];
const platformOptions = ['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'email'];

export default function PersonaLibraryPage() {
  const [personas, setPersonas] = useState([]);
  const [form, setForm] = useState({
    name: '',
    pain_points: '',
    goals: '',
    triggers: '',
    tone: '',
    platforms: [],
    tags: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    const res = await axios.get('/persona-library');
    setPersonas(res.data);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      platforms: form.platforms.join(',')
    };

    if (editingId) {
      await axios.put(`/persona-library/${editingId}`, payload);
    } else {
      await axios.post('/persona-library', payload);
    }

    setForm({
      name: '',
      pain_points: '',
      goals: '',
      triggers: '',
      tone: '',
      platforms: [],
      tags: ''
    });
    setEditingId(null);
    fetchPersonas();
  };

  const handleEdit = (p) => {
    setForm({
      ...p,
      platforms: p.platforms?.split(',') || []
    });
    setEditingId(p.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this persona?')) {
      await axios.delete(`/persona-library/${id}`);
      fetchPersonas();
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Persona Library</Typography>

      <Box sx={{ mb: 3, p: 2, background: '#2c2c2c', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>{editingId ? 'Edit Persona' : 'Add New Persona'}</Typography>

        <TextField fullWidth label="Name" sx={{ mb: 1 }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <TextField fullWidth label="Pain Points" sx={{ mb: 1 }} multiline rows={2} value={form.pain_points} onChange={e => setForm({ ...form, pain_points: e.target.value })} />
        <TextField fullWidth label="Goals" sx={{ mb: 1 }} multiline rows={2} value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} />
        <TextField fullWidth label="Triggers" sx={{ mb: 1 }} multiline rows={2} value={form.triggers} onChange={e => setForm({ ...form, triggers: e.target.value })} />

        <FormControl fullWidth sx={{ mb: 1 }}>
          <Select
            value={form.tone}
            displayEmpty
            onChange={e => setForm({ ...form, tone: e.target.value })}
          >
            <MenuItem disabled value=""><em>Select Tone</em></MenuItem>
            {toneOptions.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 1 }}>
          <Select
            multiple
            value={form.platforms}
            onChange={e => setForm({ ...form, platforms: e.target.value })}
            input={<OutlinedInput />}
            renderValue={(selected) => selected.join(', ')}
          >
            {platformOptions.map(platform => (
              <MenuItem key={platform} value={platform}>
                <Checkbox checked={form.platforms.indexOf(platform) > -1} />
                <ListItemText primary={platform} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField fullWidth label="Tags (comma-separated)" sx={{ mb: 2 }} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />

        <Button variant="contained" onClick={handleSubmit} startIcon={<Add />}>
          {editingId ? 'Update' : 'Add'}
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Pain Points</TableCell>
            <TableCell>Goals</TableCell>
            <TableCell>Triggers</TableCell>
            <TableCell>Tone</TableCell>
            <TableCell>Platforms</TableCell>
            <TableCell>Tags</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {personas.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.pain_points}</TableCell>
              <TableCell>{p.goals}</TableCell>
              <TableCell>{p.triggers}</TableCell>
              <TableCell>{p.tone}</TableCell>
              <TableCell>
                {p.platforms?.split(',').map((plat, i) => (
                  <Chip key={i} label={plat} size="small" sx={{ mr: 0.5 }} />
                ))}
              </TableCell>
              <TableCell>
                {p.tags?.split(',').map((tag, i) => (
                  <Chip key={i} label={tag.trim()} size="small" sx={{ mr: 0.5 }} />
                ))}
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleEdit(p)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(p.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
