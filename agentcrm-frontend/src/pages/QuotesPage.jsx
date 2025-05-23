import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const STATUS_OPTIONS = ['draft', 'sent', 'approved', 'rejected'];

function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newQuote, setNewQuote] = useState({
    contact_id: '',
    amount: '',
    status: 'draft',
    file: null
  });

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    api.get('/quotes').then(res => setQuotes(res.data || []));
    api.get('/contacts').then(res => setContacts(res.data || []));
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQuote(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewQuote(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = () => {
    const formData = new FormData();
    Object.entries(newQuote).forEach(([key, value]) => {
      formData.append(key, value);
    });

    api.post('/quotes', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => {
        setQuotes(prev => [res.data, ...prev]);
        setNewQuote({ contact_id: '', amount: '', status: 'draft', file: null });
      });
  };

  const handleDelete = (id) => {
    api.delete(`/quotes/${id}`).then(() => {
      setQuotes(prev => prev.filter(q => q.id !== id));
    });
  };

  const handleEdit = (quote) => {
    setEditId(quote.id);
    setEditData({ ...quote });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    api.put(`/quotes/${editId}`, editData)
      .then(() => {
        setQuotes(prev => prev.map(q => (q.id === editId ? { ...q, ...editData } : q)));
        setEditId(null);
        setEditData({});
      });
  };

  const getContactName = (id) => {
    const contact = contacts.find(c => c.id === parseInt(id));
    return contact ? contact.full_name : id;
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Quotes</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Quote</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Select
            name="contact_id"
            value={newQuote.contact_id}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="">Select Contact</MenuItem>
            {contacts.map(c => <MenuItem key={c.id} value={c.id}>{c.full_name}</MenuItem>)}
          </Select>
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={newQuote.amount}
            onChange={handleChange}
          />
          <Select
            name="status"
            value={newQuote.status}
            onChange={handleChange}
          >
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <Button variant="contained" component="label">
            Upload File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          <Button variant="contained" onClick={handleSubmit}>Add</Button>
        </Box>
      </Paper>

      {!loading && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contact</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q.id}>
                  {editId === q.id ? (
                    <>
                      <TableCell>{getContactName(q.contact_id)}</TableCell>
                      <TableCell>
                        <TextField name="amount" value={editData.amount} onChange={handleEditChange} />
                      </TableCell>
                      <TableCell>
                        <Select name="status" value={editData.status} onChange={handleEditChange}>
                          {STATUS_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>–</TableCell>
                      <TableCell>
                        <Button onClick={handleEditSave}>Save</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{getContactName(q.contact_id)}</TableCell>
                      <TableCell>{q.amount}</TableCell>
                      <TableCell>{q.status}</TableCell>
                      <TableCell>
                        {q.file_url && (
                          <a href={`http://localhost:3000${q.file_url}`} download>Download</a>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(q)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(q.id)}><DeleteIcon /></IconButton>
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

export default QuotesPage;
