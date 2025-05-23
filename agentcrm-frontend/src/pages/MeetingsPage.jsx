import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const STATUS_OPTIONS = ['scheduled', 'done', 'canceled'];

function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newMeeting, setNewMeeting] = useState({
    contact_id: '',
    title: '',
    datetime: '',
    location: '',
    status: 'scheduled',
  });

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  // 🔍 Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/meetings')
      .then(res => {
        setMeetings(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading meetings:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewMeeting(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    api.post('/meetings', newMeeting)
      .then(res => {
        const added = { id: res.data.id, ...newMeeting };
        setMeetings(prev => [added, ...prev]);
        setNewMeeting({
          contact_id: '',
          title: '',
          datetime: '',
          location: '',
          status: 'scheduled',
        });
      })
      .catch(err => {
        console.error('Error adding meeting:', err);
      });
  };

  const handleDelete = (id) => {
    api.delete(`/meetings/${id}`)
      .then(() => {
        setMeetings(prev => prev.filter(m => m.id !== id));
      })
      .catch(err => {
        console.error('Error deleting meeting:', err);
      });
  };

  const handleEdit = (meeting) => {
    setEditId(meeting.id);
    setEditData({ ...meeting });
  };

  const handleEditSave = () => {
    api.put(`/meetings/${editId}`, editData)
      .then(() => {
        setMeetings(prev =>
          prev.map(m => (m.id === editId ? { ...m, ...editData } : m))
        );
        setEditId(null);
        setEditData({});
      })
      .catch(err => {
        console.error('Error updating meeting:', err);
      });
  };

  // 🔄 Filter meetings
  const filteredMeetings = meetings.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === '' || m.status === statusFilter)
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Meetings</Typography>

      {/* 🔍 Search & Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search by Title"
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

      {/* 🆕 Add Meeting */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Meeting</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Contact ID"
            name="contact_id"
            value={newMeeting.contact_id}
            onChange={handleChange}
          />
          <TextField
            label="Title"
            name="title"
            value={newMeeting.title}
            onChange={handleChange}
          />
          <TextField
            label="Date & Time"
            type="datetime-local"
            name="datetime"
            value={newMeeting.datetime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Location or URL"
            name="location"
            value={newMeeting.location}
            onChange={handleChange}
          />
          <Select
            name="status"
            value={newMeeting.status}
            onChange={handleChange}
          >
            {STATUS_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <Button variant="contained" onClick={handleSubmit}>Add</Button>
        </Box>
      </Paper>

      {/* 📋 Table */}
      {loading ? (
        <Typography>Loading meetings...</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contact ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMeetings.map((meeting) => (
                <TableRow key={meeting.id}>
                  {editId === meeting.id ? (
                    <>
                      <TableCell>
                        <TextField
                          name="contact_id"
                          value={editData.contact_id}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="title"
                          value={editData.title}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="datetime"
                          type="datetime-local"
                          value={editData.datetime}
                          onChange={handleEditChange}
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          name="location"
                          value={editData.location}
                          onChange={handleEditChange}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          name="status"
                          value={editData.status}
                          onChange={handleEditChange}
                        >
                          {STATUS_OPTIONS.map(opt => (
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
                      <TableCell>{meeting.contact_id}</TableCell>
                      <TableCell>{meeting.title}</TableCell>
                      <TableCell>{meeting.datetime}</TableCell>
                      <TableCell>{meeting.location}</TableCell>
                      <TableCell>{meeting.status}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(meeting)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(meeting.id)}>
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

export default MeetingsPage;
