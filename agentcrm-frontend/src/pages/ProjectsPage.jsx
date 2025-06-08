import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Select, MenuItem,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Button, Chip, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const STATUS_OPTIONS = ['new', 'scoping', 'assigned', 'in_progress', 'qa', 'delivered', 'paid', 'archived'];
const STAGE_OPTIONS = ['intake', 'scoped', 'dev', 'qa', 'delivery', 'support', 'growth'];

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newProject, setNewProject] = useState({
    contact_id: '',
    title: '',
    description: '',
    status: 'new',
    stage: 'intake',
    current_agent: '',
    next_action: '',
    full_spec: '',
    admin_notes: '',
    tags: ''
  });

  useEffect(() => {
    api.get('/projects')
      .then(res => {
        setProjects(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading projects:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      ...newProject,
      tags: newProject.tags.split(',').map(tag => tag.trim())
    };
    api.post('/projects', payload)
      .then(res => {
        const added = { id: res.data.id, ...payload };
        setProjects(prev => [added, ...prev]);
        setNewProject({
          contact_id: '',
          title: '',
          description: '',
          status: 'new',
          stage: 'intake',
          current_agent: '',
          next_action: '',
          full_spec: '',
          admin_notes: '',
          tags: ''
        });
      })
      .catch(err => {
        console.error('Error adding project:', err);
      });
  };

  const handleEdit = (project) => {
    setEditId(project.id);
    setEditData({
      ...project,
      tags: (project.tags || []).join(', ')
    });
  };

  const handleEditSave = () => {
    const updated = {
      ...editData,
      tags: editData.tags.split(',').map(tag => tag.trim())
    };
    api.put(`/projects/${editId}`, updated)
      .then(() => {
        setProjects(prev => prev.map(p => (p.id === editId ? { ...p, ...updated } : p)));
        setEditId(null);
        setEditData({});
      })
      .catch(err => {
        console.error('Error updating project:', err);
      });
  };

  const handleDelete = (id) => {
    api.delete(`/projects/${id}`)
      .then(() => {
        setProjects(prev => prev.filter(p => p.id !== id));
      })
      .catch(err => {
        console.error('Error deleting project:', err);
      });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Projects</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New Project</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField name="contact_id" label="Contact ID" value={newProject.contact_id} onChange={handleChange} />
          <TextField name="title" label="Title" value={newProject.title} onChange={handleChange} />
          <TextField name="description" label="Description" value={newProject.description} onChange={handleChange} />
          <Select name="status" value={newProject.status} onChange={handleChange}>
            {STATUS_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
          <Select name="stage" value={newProject.stage} onChange={handleChange}>
            {STAGE_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
          </Select>
          <TextField name="current_agent" label="Current Agent" value={newProject.current_agent} onChange={handleChange} />
          <TextField name="next_action" label="Next Action" value={newProject.next_action} onChange={handleChange} />
          <TextField name="full_spec" label="Full Spec" value={newProject.full_spec} onChange={handleChange} />
          <TextField name="admin_notes" label="Admin Notes" value={newProject.admin_notes} onChange={handleChange} />
          <TextField name="tags" label="Tags (comma separated)" value={newProject.tags} onChange={handleChange} />
          <Button variant="contained" onClick={handleSubmit}>Add</Button>
        </Box>
      </Paper>

      {loading ? (
        <Typography>Loading projects...</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Next Action</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map(p => (
                <TableRow key={p.id}>
                  {editId === p.id ? (
                    <>
                      <TableCell><TextField name="title" value={editData.title} onChange={handleEditChange} /></TableCell>
                      <TableCell>
                        <Select name="status" value={editData.status} onChange={handleEditChange}>
                          {STATUS_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select name="stage" value={editData.stage} onChange={handleEditChange}>
                          {STAGE_OPTIONS.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </Select>
                      </TableCell>
                      <TableCell><TextField name="current_agent" value={editData.current_agent} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="next_action" value={editData.next_action} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="tags" value={editData.tags} onChange={handleEditChange} /></TableCell>
                      <TableCell>
                        <Button onClick={handleEditSave}>Save</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{p.title}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell>{p.stage}</TableCell>
                      <TableCell>{p.current_agent}</TableCell>
                      <TableCell>{p.next_action}</TableCell>
                      <TableCell>{(p.tags || []).map((tag, i) => <Chip key={i} label={tag} size="small" sx={{ mr: 0.5 }} />)}</TableCell>
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

export default ProjectsPage;
