import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Box, Chip
} from '@mui/material';

const ACTION_COLORS = {
  create: 'primary',
  update: 'secondary',
  summarize: 'warning',
  classify: 'info'
};

const STATUS_COLORS = {
  success: 'success',
  error: 'error'
};

function AgentRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/agent-requests')
      .then(res => {
        setRequests(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading agent requests:', err);
        setLoading(false);
      });
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Agent Requests</Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Input</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.agent_name}</TableCell>
                  <TableCell>
                    <Chip label={req.action} color={ACTION_COLORS[req.action]} size="small" />
                  </TableCell>
                  <TableCell>{req.target_table}#{req.target_id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap maxWidth={300}>
                      {req.input_prompt}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={req.status} color={STATUS_COLORS[req.status]} size="small" />
                  </TableCell>
                  <TableCell>{new Date(req.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}

export default AgentRequestsPage;
