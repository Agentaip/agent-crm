import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const STATUS_OPTIONS = ['new', 'hot', 'cold', 'vip', 'closed'];

function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newContact, setNewContact] = useState({
    full_name: '',
    phone: '',
    email: '',
    status: 'new',
    notes: '',
  });

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/contacts')
      .then(res => {
        setContacts(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading contacts:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewContact(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!newContact.full_name) return;
    api.post('/contacts', newContact)
      .then(res => {
        const added = { id: res.data.id, ...newContact };
        setContacts(prev => [added, ...prev]);
        setNewContact({
          full_name: '',
          phone: '',
          email: '',
          status: 'new',
          notes: '',
        });
      })
      .catch(err => {
        console.error('Error adding contact:', err);
      });
  };

  const handleDelete = (id) => {
    api.delete(`/contacts/${id}`)
      .then(() => {
        setContacts(prev => prev.filter(c => c.id !== id));
      })
      .catch(err => {
        console.error('Error deleting contact:', err);
      });
  };

  const handleEdit = (contact) => {
    setEditId(contact.id);
    setEditData({ ...contact });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    api.put(`/contacts/${editId}`, editData)
      .then(() => {
        setContacts(prev =>
          prev.map(c => (c.id === editId ? { ...c, ...editData } : c))
        );
        setEditId(null);
        setEditData({});
      })
      .catch(err => {
        console.error('Error updating contact:', err);
      });
  };

  const filteredContacts = contacts.filter(contact =>
    (contact.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
     contact.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || contact.status === statusFilter)
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Contacts</Typography>

      {/* 🔍 Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">All Statuses</MenuItem>
          {STATUS_OPTIONS.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* ➕ Add New Contact */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Contact</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Full Name"
            name="full_name"
            value={newContact.full_name}
            onChange={handleChange}
          />
          <TextField
            label="Phone"
            name="phone"
            value={newContact.phone}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            value={newContact.email}
            onChange={handleChange}
          />
          <Select
            name="status"
            value={newContact.status}
            onChange={handleChange}
            displayEmpty
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Notes"
            name="notes"
            value={newContact.notes}
            onChange={handleChange}
          />
          <Button variant="contained" onClick={handleSubmit}>
            Add
          </Button>
        </Box>
      </Paper>

      {/* 📋 Contacts Table */}
      {loading ? (
        <Typography>Loading contacts...</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  {editId === contact.id ? (
                    <>
                      <TableCell>
                        <TextField
                          name="full_name"
                          value={editData.full_name}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="phone"
                          value={editData.phone}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="email"
                          value={editData.email}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          name="status"
                          value={editData.status}
                          onChange={handleEditChange}
                          displayEmpty
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="notes"
                          value={editData.notes}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <Button onClick={handleEditSave}>Save</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{contact.full_name}</TableCell>
                      <TableCell>{contact.phone}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.status}</TableCell>
                      <TableCell>{contact.notes}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(contact)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(contact.id)}>
                          <DeleteIcon />
                        </IconButton>
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

export default ContactsPage;
