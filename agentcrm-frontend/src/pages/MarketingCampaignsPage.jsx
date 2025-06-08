import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Button, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const GOAL_OPTIONS = ['awareness', 'leads', 'retargeting', 'launch'];
const PLATFORM_OPTIONS = ['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'email'];
const STATUS_OPTIONS = ['draft', 'running', 'completed', 'paused'];

function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    goal: 'awareness',
    platform: 'facebook',
    start_date: '',
    end_date: '',
    budget: '',
    status: 'draft',
    owner_agent: '',
    summary: '',
    results_json: ''
  });

  useEffect(() => {
    api.get('/marketing-campaigns').then(res => setCampaigns(res.data || []));
    api.get('/users').then(res => setUsers(res.data || []));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCampaign(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    api.post('/marketing-campaigns', newCampaign)
      .then(res => {
        setCampaigns(prev => [ { id: res.data.id, ...newCampaign }, ...prev ]);
        setNewCampaign({
          name: '',
          goal: 'awareness',
          platform: 'facebook',
          start_date: '',
          end_date: '',
          budget: '',
          status: 'draft',
          owner_agent: '',
          summary: '',
          results_json: ''
        });
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    api.delete(`/marketing-campaigns/${id}`)
      .then(() => setCampaigns(prev => prev.filter(c => c.id !== id)))
      .catch(err => console.error(err));
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Marketing Campaigns</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New Campaign</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Name" name="name" value={newCampaign.name} onChange={handleChange} />
          <Select name="goal" value={newCampaign.goal} onChange={handleChange}>
            {GOAL_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
          <Select name="platform" value={newCampaign.platform} onChange={handleChange}>
            {PLATFORM_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
          <Select name="status" value={newCampaign.status} onChange={handleChange}>
            {STATUS_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
          <Select name="owner_agent" value={newCampaign.owner_agent} onChange={handleChange}>
            {users.map(user => (
              <MenuItem key={user.id} value={user.name}>{user.name}</MenuItem>
            ))}
          </Select>
          <TextField
            name="start_date"
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newCampaign.start_date}
            onChange={handleChange}
          />
          <TextField
            name="end_date"
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newCampaign.end_date}
            onChange={handleChange}
          />
          <TextField
            name="budget"
            label="Budget"
            type="number"
            value={newCampaign.budget}
            onChange={handleChange}
          />
          <TextField
            name="summary"
            label="Summary"
            fullWidth
            value={newCampaign.summary}
            onChange={handleChange}
          />
          <TextField
            name="results_json"
            label="Results JSON"
            fullWidth
            value={newCampaign.results_json}
            onChange={handleChange}
          />
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Goal</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map(row => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.goal}</TableCell>
                <TableCell>{row.platform}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.owner_agent}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(row.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default MarketingCampaignsPage;
