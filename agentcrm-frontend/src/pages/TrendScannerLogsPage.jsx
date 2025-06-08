import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem,
  InputLabel, FormControl, Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const sourceOptions = ['google_trends', 'tiktok', 'twitter', 'reddit', 'youtube', 'ai_blogs'];
const categoryOptions = ['ai', 'business', 'productivity', 'design', 'marketing', 'other'];

export default function TrendScannerLogsPage() {
  const [logs, setLogs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    date: '',
    source: '',
    title: '',
    relevance_score: '',
    category: '',
    insight_text: '',
    used_in: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await axios.get('/trend-scanner-logs');
    setLogs(res.data);
  };

  const handleOpen = (log = null) => {
    setEditing(log);
    setForm(
      log || {
        date: '',
        source: '',
        title: '',
        relevance_score: '',
        category: '',
        insight_text: '',
        used_in: ''
      }
    );
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (editing) {
      await axios.put(`/trend-scanner-logs/${editing.id}`, form);
    } else {
      await axios.post('/trend-scanner-logs', form);
    }
    handleClose();
    fetchLogs();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this trend log?')) {
      await axios.delete(`/trend-scanner-logs/${id}`);
      fetchLogs();
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Trend Scanner Logs</Typography>
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Trend</Button>

      <Table sx={{ mt: 2 }}>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Relevance</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Insight</TableCell>
            <TableCell>Used In</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map(log => (
            <TableRow key={log.id}>
              <TableCell>{new Date(log.date).toLocaleString()}</TableCell>
              <TableCell><Chip label={log.source} /></TableCell>
              <TableCell>{log.title}</TableCell>
              <TableCell>{log.relevance_score}</TableCell>
              <TableCell>{log.category}</TableCell>
              <TableCell>{log.insight_text}</TableCell>
              <TableCell>{log.used_in}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleOpen(log)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(log.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'Edit Trend' : 'New Trend'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Date"
            type="datetime-local"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth>
            <InputLabel>Source</InputLabel>
            <Select
              value={form.source}
              onChange={e => setForm({ ...form, source: e.target.value })}
              label="Source"
            >
              {sourceOptions.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <TextField
            label="Relevance Score"
            type="number"
            inputProps={{ min: 0, max: 100 }}
            value={form.relevance_score}
            onChange={e => setForm({ ...form, relevance_score: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              label="Category"
            >
              {categoryOptions.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Insight Text"
            multiline
            rows={3}
            value={form.insight_text}
            onChange={e => setForm({ ...form, insight_text: e.target.value })}
          />
          <TextField
            label="Used In (campaign or post)"
            value={form.used_in}
            onChange={e => setForm({ ...form, used_in: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
