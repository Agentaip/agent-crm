import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const CHANNELS = ['form', 'whatsapp', 'phone', 'email', 'instagram'];
const FUNNEL_STAGES = ['call', 'proposal', 'closed', 'rejected'];
const STATUSES = ['new', 'in_progress', 'closed'];

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newLead, setNewLead] = useState({
    title: '',
    description: '',
    contact_id: '',
    channel: 'form',
    funnel_stage: 'call',
    status: 'new',
  });

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/leads')
      .then(res => {
        setLeads(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading leads:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLead(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!newLead.title || !newLead.contact_id) return;

    api.post('/leads', newLead)
      .then(res => {
        const added = { id: res.data.id, ...newLead };
        setLeads(prev => [added, ...prev]);
        setNewLead({
          title: '',
          description: '',
          contact_id: '',
          channel: 'form',
          funnel_stage: 'call',
          status: 'new',
        });
      })
      .catch(err => {
        console.error('Error adding lead:', err);
      });
  };

  const handleDelete = (id) => {
    api.delete(`/leads/${id}`)
      .then(() => {
        setLeads(prev => prev.filter(l => l.id !== id));
      })
      .catch(err => {
        console.error('Error deleting lead:', err);
      });
  };

  const handleEdit = (lead) => {
    setEditId(lead.id);
    setEditData({ ...lead });
  };

  const handleEditSave = () => {
    api.put(`/leads/${editId}`, editData)
      .then(() => {
        setLeads(prev =>
          prev.map(l => (l.id === editId ? { ...l, ...editData } : l))
        );
        setEditId(null);
        setEditData({});
      })
      .catch(err => {
        console.error('Error updating lead:', err);
      });
  };

  const filteredLeads = leads.filter(l =>
    (l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     l.contact_id.toString().includes(searchTerm)) &&
    (statusFilter === '' || l.status === statusFilter)
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Leads</Typography>

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
          {STATUSES.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
        </Select>
      </Box>

      {/* 🆕 Add Lead Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Lead</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Title"
            name="title"
            value={newLead.title}
            onChange={handleChange}
          />
          <TextField
            label="Description"
            name="description"
            value={newLead.description}
            onChange={handleChange}
          />
          <TextField
            label="Contact ID"
            name="contact_id"
            value={newLead.contact_id}
            onChange={handleChange}
          />
          <Select name="channel" value={newLead.channel} onChange={handleChange}>
            {CHANNELS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
          <Select name="funnel_stage" value={newLead.funnel_stage} onChange={handleChange}>
            {FUNNEL_STAGES.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
          <Select name="status" value={newLead.status} onChange={handleChange}>
            {STATUSES.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
          <Button variant="contained" onClick={handleSubmit}>Add</Button>
        </Box>
      </Paper>

      {/* 📋 Leads Table */}
      {loading ? (
        <Typography>Loading leads...</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Contact ID</TableCell>
                <TableCell>Channel</TableCell>
                <TableCell>Funnel Stage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  {editId === lead.id ? (
                    <>
                      <TableCell>
                        <TextField
                          name="title"
                          value={editData.title}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="description"
                          value={editData.description}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="contact_id"
                          value={editData.contact_id}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          name="channel"
                          value={editData.channel}
                          onChange={handleEditChange}
                        >
                          {CHANNELS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          name="funnel_stage"
                          value={editData.funnel_stage}
                          onChange={handleEditChange}
                        >
                          {FUNNEL_STAGES.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          name="status"
                          value={editData.status}
                          onChange={handleEditChange}
                        >
                          {STATUSES.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button onClick={handleEditSave}>Save</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{lead.title}</TableCell>
                      <TableCell>{lead.description}</TableCell>
                      <TableCell>{lead.contact_id}</TableCell>
                      <TableCell>{lead.channel}</TableCell>
                      <TableCell>{lead.funnel_stage}</TableCell>
                      <TableCell>{lead.status}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(lead)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(lead.id)}>
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

export default LeadsPage;
