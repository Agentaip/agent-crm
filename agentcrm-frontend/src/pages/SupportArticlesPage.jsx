import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Select, MenuItem, Button, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

const AGENTS = ['SupportAgent', 'DeliveryAgent', 'BillingAgent'];
const CATEGORIES = ['usage', 'bug', 'change', 'onboarding', 'general'];

function SupportArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [newArticle, setNewArticle] = useState({
    question_keywords: '',
    answer_text: '',
    related_agent: '',
    category: '',
    media_link: '',
    last_updated: '',
    times_used: 0
  });
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    api.get('/support-articles').then(res => {
      setArticles(res.data || []);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewArticle(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    api.post('/support-articles', newArticle).then(res => {
      setArticles(prev => [{ id: res.data.id, ...newArticle }, ...prev]);
      setNewArticle({
        question_keywords: '',
        answer_text: '',
        related_agent: '',
        category: '',
        media_link: '',
        last_updated: '',
        times_used: 0
      });
    });
  };

  const handleEdit = (article) => {
    setEditId(article.id);
    setEditData({ ...article });
  };

  const handleEditSave = () => {
    api.put(`/support-articles/${editId}`, editData).then(() => {
      setArticles(prev =>
        prev.map(a => (a.id === editId ? { ...editData } : a))
      );
      setEditId(null);
      setEditData({});
    });
  };

  const handleDelete = (id) => {
    api.delete(`/support-articles/${id}`).then(() => {
      setArticles(prev => prev.filter(a => a.id !== id));
    });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Support Articles</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Add New Article</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Keywords"
            name="question_keywords"
            value={newArticle.question_keywords}
            onChange={handleChange}
          />
          <TextField
            label="Answer Text"
            name="answer_text"
            fullWidth
            value={newArticle.answer_text}
            onChange={handleChange}
          />
          <Select
            name="related_agent"
            value={newArticle.related_agent}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="">Select Agent</MenuItem>
            {AGENTS.map(agent => (
              <MenuItem key={agent} value={agent}>{agent}</MenuItem>
            ))}
          </Select>
          <Select
            name="category"
            value={newArticle.category}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="">Select Category</MenuItem>
            {CATEGORIES.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Media Link"
            name="media_link"
            value={newArticle.media_link}
            onChange={handleChange}
          />
          <TextField
            label="Last Updated"
            name="last_updated"
            type="datetime-local"
            value={newArticle.last_updated}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Times Used"
            name="times_used"
            type="number"
            value={newArticle.times_used}
            onChange={handleChange}
          />
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </Box>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Keywords</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>Agent</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Media</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Times Used</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                {editId === article.id ? (
                  <>
                    <TableCell>
                      <TextField
                        name="question_keywords"
                        value={editData.question_keywords}
                        onChange={handleEditChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="answer_text"
                        value={editData.answer_text}
                        onChange={handleEditChange}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        name="related_agent"
                        value={editData.related_agent}
                        onChange={handleEditChange}
                      >
                        {AGENTS.map(agent => (
                          <MenuItem key={agent} value={agent}>{agent}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        name="category"
                        value={editData.category}
                        onChange={handleEditChange}
                      >
                        {CATEGORIES.map(cat => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="media_link"
                        value={editData.media_link}
                        onChange={handleEditChange}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="last_updated"
                        type="datetime-local"
                        value={editData.last_updated}
                        onChange={handleEditChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        name="times_used"
                        type="number"
                        value={editData.times_used}
                        onChange={handleEditChange}
                      />
                    </TableCell>
                    <TableCell>
                      <Button onClick={handleEditSave}>Save</Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>{article.question_keywords}</TableCell>
                    <TableCell>{article.answer_text}</TableCell>
                    <TableCell>{article.related_agent}</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>{article.media_link}</TableCell>
                    <TableCell>{article.last_updated}</TableCell>
                    <TableCell>{article.times_used}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(article)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(article.id)}><DeleteIcon /></IconButton>
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

export default SupportArticlesPage;
