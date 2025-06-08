import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, IconButton, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const STATUS_OPTIONS = ['paid', 'pending', 'late'];

function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialForm = {
    quote_id: '',
    amount: '',
    status: 'pending',
    due_date: '',
    paid_at: '',
    reminder_count: 0,
    last_reminder_at: '',
    client_email: '',
    notes: ''
  };

  const [newPayment, setNewPayment] = useState(initialForm);
  const [invoiceFile, setInvoiceFile] = useState(null);
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

  const handleFileChange = (e) => {
    setInvoiceFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(newPayment).forEach(([key, value]) =>
      formData.append(key, value)
    );
    if (invoiceFile) formData.append('invoice', invoiceFile);

    api.post('/payments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(res => {
        const added = { id: res.data.id, ...newPayment, invoice_link: res.data.invoice_link };
        setPayments(prev => [added, ...prev]);
        setNewPayment(initialForm);
        setInvoiceFile(null);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'late': return 'red';
      default: return 'inherit';
    }
  };

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
          <TextField label="Quote ID" name="quote_id" value={newPayment.quote_id} onChange={handleChange} />
          <TextField label="Amount" name="amount" type="number" value={newPayment.amount} onChange={handleChange} />
          <Select name="status" value={newPayment.status} onChange={handleChange}>
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField label="Due Date" name="due_date" type="date" value={newPayment.due_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Paid At" name="paid_at" type="date" value={newPayment.paid_at} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Reminder Count" name="reminder_count" type="number" value={newPayment.reminder_count} onChange={handleChange} />
          <TextField label="Last Reminder At" name="last_reminder_at" type="datetime-local" value={newPayment.last_reminder_at} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField label="Client Email" name="client_email" value={newPayment.client_email} onChange={handleChange} />
          <TextField label="Notes" name="notes" value={newPayment.notes} onChange={handleChange} />
          <Box>
            <InputLabel>Invoice File</InputLabel>
            <input type="file" onChange={handleFileChange} />
          </Box>
          <Button variant="contained" onClick={handleSubmit}>Add</Button>
        </Box>
      </Paper>

      {/* Table */}
      {loading ? (
        <Typography>Loading payments...</Typography>
      ) : (
        <Paper sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Quote ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Paid At</TableCell>
                <TableCell>Reminder Count</TableCell>
                <TableCell>Last Reminder</TableCell>
                <TableCell>Client Email</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.quote_id}</TableCell>
                  <TableCell>{p.amount}</TableCell>
                  <TableCell sx={{ color: getStatusColor(p.status), fontWeight: 'bold' }}>{p.status}</TableCell>
                  <TableCell>{p.due_date}</TableCell>
                  <TableCell>{p.paid_at}</TableCell>
                  <TableCell>{p.reminder_count}</TableCell>
                  <TableCell>{p.last_reminder_at}</TableCell>
                  <TableCell>{p.client_email}</TableCell>
                  <TableCell>
                    {p.invoice_link && (
                      <a href={p.invoice_link} target="_blank" rel="noopener noreferrer">View</a>
                    )}
                  </TableCell>
                  <TableCell>{p.notes}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(p)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(p.id)}><DeleteIcon /></IconButton>
                  </TableCell>
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
