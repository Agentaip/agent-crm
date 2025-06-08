import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import axios from 'axios';

export default function SupportRequests() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    client_id: '',
    project_id: '',
    message: '',
    type: 'question',
    emotion: 'calm',
    status: 'new',
    handled_by: ''
  });

  const fetchRequests = async () => {
    const res = await axios.get('/support-requests');
    setRequests(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await axios.post('/support-requests', form);
    setForm({
      client_id: '',
      project_id: '',
      message: '',
      type: 'question',
      emotion: 'calm',
      status: 'new',
      handled_by: ''
    });
    fetchRequests();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/support-requests/${id}`);
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Support Requests
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6">Add Support Request</Typography>
        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          <TextField
            label="Client ID"
            name="client_id"
            value={form.client_id}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Project ID"
            name="project_id"
            value={form.project_id}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Message"
            name="message"
            value={form.message}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select name="type" value={form.type} onChange={handleChange}>
              <MenuItem value="question">Question</MenuItem>
              <MenuItem value="bug">Bug</MenuItem>
              <MenuItem value="change">Change</MenuItem>
              <MenuItem value="upgrade">Upgrade</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Emotion</InputLabel>
            <Select name="emotion" value={form.emotion} onChange={handleChange}>
              <MenuItem value="calm">Calm</MenuItem>
              <MenuItem value="frustrated">Frustrated</MenuItem>
              <MenuItem value="angry">Angry</MenuItem>
              <MenuItem value="confused">Confused</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select name="status" value={form.status} onChange={handleChange}>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
              <MenuItem value="escalated">Escalated</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Handled By"
            name="handled_by"
            value={form.handled_by}
            onChange={handleChange}
            fullWidth
          />
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Existing Requests
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Project</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Emotion</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Handled By</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.id}</TableCell>
              <TableCell>{r.client_id}</TableCell>
              <TableCell>{r.project_id}</TableCell>
              <TableCell>{r.type}</TableCell>
              <TableCell>{r.emotion}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>{r.handled_by}</TableCell>
              <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
              <TableCell>
                <Button size="small" color="error" onClick={() => handleDelete(r.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
