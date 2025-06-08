import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListSubheader
} from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

// Icons
import SettingsIcon from '@mui/icons-material/Settings';
import PostAddIcon from '@mui/icons-material/PostAdd';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import PaidIcon from '@mui/icons-material/Paid';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ChecklistIcon from '@mui/icons-material/Checklist';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArticleIcon from '@mui/icons-material/Article';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import RadarIcon from '@mui/icons-material/Radar';
import ScienceIcon from '@mui/icons-material/Science';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SupportIcon from '@mui/icons-material/ReportProblem'; // ✅ חדש – לאייקון של Support Requests

const drawerWidth = 200;

export default function MainLayout() {
  return (
    <Box sx={{ display: 'flex' }}>
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
            <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button component={Link} to="/contacts">
            <ContactPhoneIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Contacts" />
          </ListItem>
          <ListItem button component={Link} to="/leads">
            <WorkOutlineIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Leads" />
          </ListItem>
          <ListItem button component={Link} to="/tasks">
            <AssignmentIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Tasks" />
          </ListItem>
          <ListItem button component={Link} to="/meetings">
            <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Meetings" />
          </ListItem>
          <ListItem button component={Link} to="/quotes">
            <RequestPageIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Quotes" />
          </ListItem>
          <ListItem button component={Link} to="/payments">
            <PaidIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Payments" />
          </ListItem>
          <ListItem button component={Link} to="/agent-requests">
            <SupportAgentIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Agent Requests" />
          </ListItem>
          <ListItem button component={Link} to="/users">
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem button component={Link} to="/freelancers">
            <Diversity3Icon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Freelancers" />
          </ListItem>
          <ListItem button component={Link} to="/projects">
            <FolderSharedIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Projects" />
          </ListItem>
          <ListItem button component={Link} to="/project-assignments">
            <AssignmentIndIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Project Assignments" />
          </ListItem>
          <ListItem button component={Link} to="/qa-reviews">
            <ChecklistIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="QA Reviews" />
          </ListItem>
          <ListItem button component={Link} to="/deliveries">
            <LocalShippingIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Deliveries" />
          </ListItem>
          <ListItem button component={Link} to="/support-articles">
            <ArticleIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Support Articles" />
          </ListItem>
          <ListItem button component={Link} to="/growth-opportunities">
            <TrendingUpIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Growth Opportunities" />
          </ListItem>
          <ListItem button component={Link} to="/marketing-insights">
            <InsightsIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Marketing Insights" />
          </ListItem>

          {/* --- System Section --- */}
          <ListSubheader inset>System Tools</ListSubheader>
          <ListItem button component={Link} to="/system-changes">
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="System Changes" />
          </ListItem>
          <ListItem button component={Link} to="/content-posts">
            <PostAddIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Content Posts" />
          </ListItem>
          <ListItem button component={Link} to="/content-feedback">
            <FeedbackIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Content Feedback" />
          </ListItem>
          <ListItem button component={Link} to="/content-ideas">
            <LightbulbIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Content Ideas" />
          </ListItem>
          <ListItem button component={Link} to="/marketing-campaigns">
            <CampaignIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Marketing Campaigns" />
          </ListItem>
          <ListItem button component={Link} to="/persona-library">
            <GroupIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Persona Library" />
          </ListItem>
          <ListItem button component={Link} to="/trend-scanner-logs">
            <RadarIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Trend Scanner" />
          </ListItem>
          <ListItem button component={Link} to="/campaign-tests">
            <ScienceIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Campaign Tests" />
          </ListItem>
          <ListItem button component={Link} to="/content-remixes">
            <AutoAwesomeIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Content Remixes" />
          </ListItem>
          <ListItem button component={Link} to="/support-requests">
            <SupportIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText primary="Support Requests" />
          </ListItem>
        </List>
      </Drawer>

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
