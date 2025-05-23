import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const STATUS_OPTIONS = ['paid', 'pending', 'late'];

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPayment, setNewPayment] = useState({
    quote_id: '',
    amount: '',
    status: 'pending',
    due_date: '',
    paid_at: '',
  });

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/payments')
      .then(res => {
        setPayments(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading payments:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    api.post('/payments', newPayment)
      .then(res => {
        const added = { id: res.data.id, ...newPayment };
        setPayments(prev => [added, ...prev]);
        setNewPayment({
          quote_id: '',
          amount: '',
          status: 'pending',
          due_date: '',
          paid_at: '',
        });
      })
      .catch(err => {
        console.error('Error adding payment:', err);
      });
  };

  const handleDelete = (id) => {
    api.delete(`/payments/${id}`)
      .then(() => {
        setPayments(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => {
        console.error('Error deleting payment:', err);
      });
  };

  const handleEdit = (payment) => {
    setEditId(payment.id);
    setEditData({ ...payment });
  };

  const handleEditSave = () => {
    api.put(`/payments/${editId}`, editData)
      .then(() => {
        setPayments(prev => prev.map(p => (p.id === editId ? { ...p, ...editData } : p)));
        setEditId(null);
        setEditData({});
      })
      .catch(err => {
        console.error('Error updating payment:', err);
      });
  };

  const filtered = payments.filter(p => !statusFilter || p.status === statusFilter);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Payments</Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All</MenuItem>
          {STATUS_OPTIONS.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New Payment</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Quote ID"
            name="quote_id"
            value={newPayment.quote_id}
            onChange={handleChange}
          />
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={newPayment.amount}
            onChange={handleChange}
          />
          <Select name="status" value={newPayment.status} onChange={handleChange}>
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Due Date"
            type="date"
            name="due_date"
            value={newPayment.due_date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Paid At"
            type="date"
            name="paid_at"
            value={newPayment.paid_at}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" onClick={handleSubmit}>Add</Button>
        </Box>
      </Paper>

      {/* Table */}
      {loading ? (
        <Typography>Loading payments...</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quote ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Paid At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  {editId === p.id ? (
                    <>
                      <TableCell>
                        <TextField name="quote_id" value={editData.quote_id} onChange={handleEditChange} />
                      </TableCell>
                      <TableCell>
                        <TextField name="amount" type="number" value={editData.amount} onChange={handleEditChange} />
                      </TableCell>
                      <TableCell>
                        <Select name="status" value={editData.status} onChange={handleEditChange}>
                          {STATUS_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField name="due_date" type="date" value={editData.due_date} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
                      </TableCell>
                      <TableCell>
                        <TextField name="paid_at" type="date" value={editData.paid_at} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
                      </TableCell>
                      <TableCell>
                        <Button onClick={handleEditSave}>Save</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{p.quote_id}</TableCell>
                      <TableCell>{p.amount}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell>{p.due_date}</TableCell>
                      <TableCell>{p.paid_at}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(p)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(p.id)}><DeleteIcon /></IconButton>
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

export default PaymentsPage;
