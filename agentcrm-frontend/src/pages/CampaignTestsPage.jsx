import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const testTypes = ['headline', 'image', 'CTA', 'audience', 'timing'];
const results = ['a_wins', 'b_wins', 'inconclusive'];

export default function CampaignTestsPage() {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({
    campaign_id: '',
    test_type: '',
    version_a: '',
    version_b: '',
    result: '',
    tested_at: '',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await axios.get('/campaign-tests');
      setTests(res.data);
    } catch (err) {
      console.error('Error fetching tests:', err);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/campaign-tests/${editingId}`, form);
      } else {
        await axios.post('/campaign-tests', form);
      }
      setForm({
        campaign_id: '',
        test_type: '',
        version_a: '',
        version_b: '',
        result: '',
        tested_at: '',
        notes: ''
      });
      setEditingId(null);
      fetchTests();
    } catch (err) {
      console.error('Error saving test:', err);
    }
  };

  const handleEdit = test => {
    setForm(test);
    setEditingId(test.id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this test?')) return;
    try {
      await axios.delete(`/campaign-tests/${id}`);
      fetchTests();
    } catch (err) {
      console.error('Error deleting test:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>📊 Campaign Tests</Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}
      >
        <TextField
          label="Campaign ID"
          name="campaign_id"
          value={form.campaign_id}
          onChange={handleChange}
          type="number"
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Test Type</InputLabel>
          <Select
            name="test_type"
            value={form.test_type}
            onChange={handleChange}
            label="Test Type"
          >
            {testTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Version A"
          name="version_a"
          value={form.version_a}
          onChange={handleChange}
        />
        <TextField
          label="Version B"
          name="version_b"
          value={form.version_b}
          onChange={handleChange}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Result</InputLabel>
          <Select
            name="result"
            value={form.result}
            onChange={handleChange}
            label="Result"
          >
            {results.map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Tested At"
          name="tested_at"
          type="datetime-local"
          value={form.tested_at}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: 'center', height: 56 }}>
          {editingId ? 'Update' : 'Create'}
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Campaign ID</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Version A</TableCell>
            <TableCell>Version B</TableCell>
            <TableCell>Result</TableCell>
            <TableCell>Tested At</TableCell>
            <TableCell>Notes</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tests.map(test => (
            <TableRow key={test.id}>
              <TableCell>{test.id}</TableCell>
              <TableCell>{test.campaign_id}</TableCell>
              <TableCell>{test.test_type}</TableCell>
              <TableCell>{test.version_a}</TableCell>
              <TableCell>{test.version_b}</TableCell>
              <TableCell>{test.result}</TableCell>
              <TableCell>{new Date(test.tested_at).toLocaleString()}</TableCell>
              <TableCell>{test.notes}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleEdit(test)}><Edit /></IconButton>
                <IconButton onClick={() => handleDelete(test.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
