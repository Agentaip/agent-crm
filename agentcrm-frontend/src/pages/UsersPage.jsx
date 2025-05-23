import { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const ROLES = ['admin', 'agent', 'viewer'];

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'agent', api_key: '' });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    api.get('/users')
      .then(res => {
        setUsers(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading users:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!newUser.name || !newUser.email) return;
    api.post('/users', newUser)
      .then(res => {
        const added = { id: res.data.id, ...newUser };
        setUsers(prev => [added, ...prev]);
        setNewUser({ name: '', email: '', role: 'agent', api_key: '' });
      })
      .catch(err => console.error('Error adding user:', err));
  };

  const handleDelete = (id) => {
    api.delete(`/users/${id}`)
      .then(() => setUsers(prev => prev.filter(u => u.id !== id)))
      .catch(err => console.error('Error deleting user:', err));
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setEditData({ ...user });
  };

  const handleEditSave = () => {
    api.put(`/users/${editId}`, editData)
      .then(() => {
        setUsers(prev => prev.map(u => (u.id === editId ? { ...u, ...editData } : u)));
        setEditId(null);
        setEditData({});
      })
      .catch(err => console.error('Error updating user:', err));
  };

  const filteredUsers = users.filter(u =>
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === '' || u.role === roleFilter)
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Users</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} displayEmpty>
          <MenuItem value="">All Roles</MenuItem>
          {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </Select>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New User</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Name" name="name" value={newUser.name} onChange={handleChange} />
          <TextField label="Email" name="email" value={newUser.email} onChange={handleChange} />
          <Select name="role" value={newUser.role} onChange={handleChange}>
            {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
          <TextField label="API Key" name="api_key" value={newUser.api_key} onChange={handleChange} />
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>API Key</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                {editId === user.id ? (
                  <>
                    <TableCell><TextField name="name" value={editData.name} onChange={handleEditChange} /></TableCell>
                    <TableCell><TextField name="email" value={editData.email} onChange={handleEditChange} /></TableCell>
                    <TableCell>
                      <Select name="role" value={editData.role} onChange={handleEditChange}>
                        {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                      </Select>
                    </TableCell>
                    <TableCell><TextField name="api_key" value={editData.api_key} onChange={handleEditChange} /></TableCell>
                    <TableCell><Button onClick={handleEditSave}>Save</Button></TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.api_key}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(user)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(user.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}

export default UsersPage;
