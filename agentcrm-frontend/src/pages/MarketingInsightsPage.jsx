import { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Container, Typography, TextField, Select, MenuItem, Button,
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Box, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const INSIGHT_TYPES = ['engagement', 'conversion', 'content', 'ad_performance', 'cta', 'general'];
const SOURCE_TYPES = ['post', 'campaign', 'funnel', 'quote', 'lead'];
const CHART_COLORS = ['#00bcd4', '#ff4081', '#ffc107', '#4caf50', '#e91e63', '#9c27b0'];

function MarketingInsightsPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  const initialForm = {
    client_segment: '',
    insight_type: 'engagement',
    insight_text: '',
    source_type: '',
    source_id: '',
    impact_score: '',
    recommendation: '',
    used_in_strategy: false,
    used_by_agent: '',
    notes: ''
  };

  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    api.get('/marketing-insights')
      .then(res => {
        setInsights(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading insights:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    api.post('/marketing-insights', form)
      .then(res => {
        setInsights(prev => [{ id: res.data.id, ...form }, ...prev]);
        setForm(initialForm);
      })
      .catch(err => {
        console.error('Error creating insight:', err);
      });
  };

  const handleDelete = (id) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const handleEdit = (insight) => {
    setEditId(insight.id);
    setEditData({ ...insight });
  };

  const handleEditSave = () => {
    setInsights(prev => prev.map(i => (i.id === editId ? { ...i, ...editData } : i)));
    setEditId(null);
    setEditData({});
  };

  const filtered = insights.filter(i => !filterType || i.insight_type === filterType);

  const pieData = INSIGHT_TYPES.map(type => ({
    name: type,
    value: insights.filter(i => i.insight_type === type).length
  })).filter(d => d.value > 0);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Marketing Insights</Typography>

      {/* Pie Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Distribution by Type</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>

      {/* Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          displayEmpty
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Types</MenuItem>
          {INSIGHT_TYPES.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Add New Insight</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField label="Client Segment" name="client_segment" value={form.client_segment} onChange={handleChange} sx={{ minWidth: 180 }} />
          <Select name="insight_type" value={form.insight_type} onChange={handleChange} sx={{ minWidth: 160 }}>
            {INSIGHT_TYPES.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField label="Insight Text" name="insight_text" value={form.insight_text} onChange={handleChange} sx={{ minWidth: 300, flexGrow: 1 }} />
          <Select name="source_type" value={form.source_type} onChange={handleChange} displayEmpty sx={{ minWidth: 140 }}>
            <MenuItem value="">Choose Source Type</MenuItem>
            {SOURCE_TYPES.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
          <TextField label="Source ID" name="source_id" value={form.source_id} onChange={handleChange} sx={{ minWidth: 100 }} />
          <TextField label="Impact Score" name="impact_score" type="number" value={form.impact_score} onChange={handleChange} sx={{ minWidth: 100 }} />
          <TextField label="Recommendation" name="recommendation" value={form.recommendation} onChange={handleChange} sx={{ minWidth: 300, flexGrow: 1 }} />
          <TextField label="Used by Agent" name="used_by_agent" value={form.used_by_agent} onChange={handleChange} sx={{ minWidth: 160 }} />
          <TextField label="Notes" name="notes" value={form.notes} onChange={handleChange} sx={{ minWidth: 200 }} />
          <Button variant="contained" onClick={handleSubmit}>Add Insight</Button>
        </Box>
      </Paper>

      {/* Table */}
      {loading ? (
        <Typography>Loading insights...</Typography>
      ) : (
        <Paper sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Segment</TableCell>
                <TableCell>Text</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.insight_type}</TableCell>
                  <TableCell>{i.client_segment}</TableCell>
                  <TableCell>{i.insight_text}</TableCell>
                  <TableCell>{i.source_type} #{i.source_id}</TableCell>
                  <TableCell>{i.impact_score}</TableCell>
                  <TableCell>{i.used_by_agent}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(i)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(i.id)}><DeleteIcon /></IconButton>
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

export default MarketingInsightsPage;
