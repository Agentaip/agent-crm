import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Paper, Table, TableHead, TableRow, TableCell, TableBody, Box, IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const STATUS_OPTIONS = ['open', 'in_progress', 'delayed', 'done'];
const RELATED_TO_OPTIONS = ['lead', 'contact', 'project', 'agent'];
const TYPE_OPTIONS = ['QA', 'Bug', 'Development', 'Content', 'Follow-up'];
const PRIORITY_OPTIONS = ['low', 'normal', 'high'];

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: '',
    assigned_to: '',
    due_date: '',
    status: 'open',
    priority: 'normal',
    related_to: 'lead',
    related_id: '',
    notes: ''
  });

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api.get('/tasks')
      .then(res => {
        setTasks(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading tasks:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!newTask.title || !newTask.related_id) return;

    api.post('/tasks', newTask)
      .then(res => {
        const added = { id: res.data.id, ...newTask };
        setTasks(prev => [added, ...prev]);
        setNewTask({
          title: '',
          description: '',
          type: '',
          assigned_to: '',
          due_date: '',
          status: 'open',
          priority: 'normal',
          related_to: 'lead',
          related_id: '',
          notes: ''
        });
      })
      .catch(err => {
        console.error('Error adding task:', err);
      });
  };

  const handleDelete = (id) => {
    api.delete(`/tasks/${id}`)
      .then(() => {
        setTasks(prev => prev.filter(t => t.id !== id));
      })
      .catch(err => {
        console.error('Error deleting task:', err);
      });
  };

  const handleEdit = (task) => {
    setEditId(task.id);
    setEditData({ ...task });
  };

  const handleEditSave = () => {
    api.put(`/tasks/${editId}`, editData)
      .then(() => {
        setTasks(prev =>
          prev.map(t => (t.id === editId ? { ...t, ...editData } : t))
        );
        setEditId(null);
        setEditData({});
      })
      .catch(err => {
        console.error('Error updating task:', err);
      });
  };

  const filteredTasks = tasks.filter(t =>
    (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.related_id.toString().includes(searchTerm)) &&
    (statusFilter === '' || t.status === statusFilter)
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Tasks</Typography>

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

      {/* ➕ Add Task */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Task</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Title" name="title" value={newTask.title} onChange={handleChange} />
          <TextField label="Description" name="description" value={newTask.description} onChange={handleChange} />
          <Select name="type" value={newTask.type} onChange={handleChange} displayEmpty>
            <MenuItem value="">Type</MenuItem>
            {TYPE_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField label="Assigned To" name="assigned_to" value={newTask.assigned_to} onChange={handleChange} />
          <TextField type="date" label="Due Date" name="due_date" value={newTask.due_date} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <Select name="status" value={newTask.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <Select name="priority" value={newTask.priority} onChange={handleChange}>
            {PRIORITY_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <Select name="related_to" value={newTask.related_to} onChange={handleChange}>
            {RELATED_TO_OPTIONS.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField label="Related ID" name="related_id" value={newTask.related_id} onChange={handleChange} />
          <TextField label="Notes" name="notes" value={newTask.notes} onChange={handleChange} />
          <Button variant="contained" onClick={handleSubmit}>Add</Button>
        </Box>
      </Paper>

      {/* 📋 Tasks Table */}
      {loading ? (
        <Typography>Loading tasks...</Typography>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Related To</TableCell>
                <TableCell>Related ID</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  {editId === task.id ? (
                    <>
                      <TableCell><TextField name="title" value={editData.title} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="description" value={editData.description} onChange={handleEditChange} /></TableCell>
                      <TableCell>
                        <Select name="type" value={editData.type} onChange={handleEditChange}>
                          {TYPE_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell><TextField name="assigned_to" value={editData.assigned_to} onChange={handleEditChange} /></TableCell>
                      <TableCell>
                        <Select name="status" value={editData.status} onChange={handleEditChange}>
                          {STATUS_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select name="priority" value={editData.priority} onChange={handleEditChange}>
                          {PRIORITY_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <TextField type="date" name="due_date" value={editData.due_date} onChange={handleEditChange} InputLabelProps={{ shrink: true }} />
                      </TableCell>
                      <TableCell>
                        <Select name="related_to" value={editData.related_to} onChange={handleEditChange}>
                          {RELATED_TO_OPTIONS.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell><TextField name="related_id" value={editData.related_id} onChange={handleEditChange} /></TableCell>
                      <TableCell><TextField name="notes" value={editData.notes} onChange={handleEditChange} /></TableCell>
                      <TableCell>
                        <Button onClick={handleEditSave}>Save</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.description}</TableCell>
                      <TableCell>{task.type}</TableCell>
                      <TableCell>{task.assigned_to}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>{task.due_date}</TableCell>
                      <TableCell>{task.related_to}</TableCell>
                      <TableCell>{task.related_id}</TableCell>
                      <TableCell>{task.notes}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(task)}><EditIcon /></IconButton>
                        <IconButton onClick={() => handleDelete(task.id)}><DeleteIcon /></IconButton>
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

export default TasksPage;
