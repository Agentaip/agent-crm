import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import axios from 'axios';

export default function GrowthOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [newOpportunity, setNewOpportunity] = useState({
    client_id: '',
    project_id: '',
    suggested_offer: '',
    status: 'sent',
    response_date: '',
    next_step: '',
    sent_by: '',
    notes: '',
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await axios.get('/growth-opportunities');
      setOpportunities(res.data);
    } catch (error) {
      console.error('Error fetching growth opportunities:', error);
    }
  };

  const handleChange = (e) => {
    setNewOpportunity({
      ...newOpportunity,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdd = async () => {
    try {
      await axios.post('/growth-opportunities', newOpportunity);
      setNewOpportunity({
        client_id: '',
        project_id: '',
        suggested_offer: '',
        status: 'sent',
        response_date: '',
        next_step: '',
        sent_by: '',
        notes: '',
      });
      fetchOpportunities();
    } catch (error) {
      console.error('Error adding growth opportunity:', error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Growth Opportunities
      </Typography>

      <Stack spacing={2} direction="row" flexWrap="wrap" sx={{ mb: 2 }}>
        <TextField
          label="Client ID"
          name="client_id"
          value={newOpportunity.client_id}
          onChange={handleChange}
        />
        <TextField
          label="Project ID"
          name="project_id"
          value={newOpportunity.project_id}
          onChange={handleChange}
        />
        <TextField
          label="Suggested Offer"
          name="suggested_offer"
          value={newOpportunity.suggested_offer}
          onChange={handleChange}
        />
        <TextField
          label="Status"
          name="status"
          value={newOpportunity.status}
          onChange={handleChange}
        />
        <TextField
          label="Response Date"
          name="response_date"
          type="datetime-local"
          value={newOpportunity.response_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Next Step"
          name="next_step"
          value={newOpportunity.next_step}
          onChange={handleChange}
        />
        <TextField
          label="Sent By"
          name="sent_by"
          value={newOpportunity.sent_by}
          onChange={handleChange}
        />
        <TextField
          label="Notes"
          name="notes"
          value={newOpportunity.notes}
          onChange={handleChange}
        />
        <Button variant="contained" onClick={handleAdd}>
          Add
        </Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Client ID</TableCell>
            <TableCell>Project ID</TableCell>
            <TableCell>Suggested Offer</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Response Date</TableCell>
            <TableCell>Next Step</TableCell>
            <TableCell>Sent By</TableCell>
            <TableCell>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {opportunities.map((op) => (
            <TableRow key={op.id}>
              <TableCell>{op.id}</TableCell>
              <TableCell>{op.client_id}</TableCell>
              <TableCell>{op.project_id}</TableCell>
              <TableCell>{op.suggested_offer}</TableCell>
              <TableCell>{op.status}</TableCell>
              <TableCell>{op.response_date}</TableCell>
              <TableCell>{op.next_step}</TableCell>
              <TableCell>{op.sent_by}</TableCell>
              <TableCell>{op.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
