import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

const drawerWidth = 200;

export default function MainLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box'
          }
        }}
      >
        <Toolbar />
        <List>
          <ListItem button component={Link} to="/">
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button component={Link} to="/contacts">
            <ListItemText primary="Contacts" />
          </ListItem>
          <ListItem button component={Link} to="/leads">
            <ListItemText primary="Leads" />
          </ListItem>
          <ListItem button component={Link} to="/tasks">
            <ListItemText primary="Tasks" />
          </ListItem>
          <ListItem button component={Link} to="/meetings">
            <ListItemText primary="Meetings" />
          </ListItem>
          <ListItem button component={Link} to="/quotes">
            <ListItemText primary="Quotes" />
          </ListItem>
          <ListItem button component={Link} to="/payments">
            <ListItemText primary="Payments" />
          </ListItem>
          <ListItem button component={Link} to="/agent-requests">
            <ListItemText primary="Agent Requests" />
          </ListItem>
          <ListItem button component={Link} to="/users">
            <ListItemText primary="Users" />
          </ListItem>
        </List>
      </Drawer>

      {/* TopBar + Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <AppBar position="fixed" sx={{ zIndex: 1201 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              AgentCRM – AI Management Panel
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
