import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';
import ContactsPage from './pages/ContactsPage';
import LeadsPage from './pages/LeadsPage';
import TasksPage from './pages/TasksPage';
import MeetingsPage from './pages/MeetingsPage';
import QuotesPage from './pages/QuotesPage';
import PaymentsPage from './pages/PaymentsPage';
import AgentRequestsPage from './pages/AgentRequestsPage';
import UsersPage from './pages/UsersPage';
import FreelancersPage from './pages/FreelancersPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectAssignmentsPage from './pages/ProjectAssignmentsPage';
import QaReviewsPage from './pages/QaReviewsPage';
import DeliveriesPage from './pages/DeliveriesPage';
import SupportArticlesPage from './pages/SupportArticlesPage';
import GrowthOpportunitiesPage from './pages/GrowthOpportunitiesPage';
import MarketingInsightsPage from './pages/MarketingInsightsPage';
import SystemChangesPage from './pages/SystemChangesPage';
import ContentPostsPage from './pages/ContentPostsPage';
import ContentFeedbackPage from './pages/ContentFeedbackPage';
import ContentIdeasPage from './pages/ContentIdeasPage';
import MarketingCampaignsPage from './pages/MarketingCampaignsPage';
import PersonaLibraryPage from './pages/PersonaLibraryPage';
import TrendScannerLogsPage from './pages/TrendScannerLogsPage';
import CampaignTestsPage from './pages/CampaignTestsPage';
import ContentRemixesPage from './pages/ContentRemixesPage'; // ✅ חדש
import SupportRequestsPage from './pages/SupportRequestsPage'; // ✅ חדש

function HomePage() {
  return (
    <div>
      <h1>Welcome to AgentCRM</h1>
      <p>This is the management dashboard for AI agents and internal teams.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="quotes" element={<QuotesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="agent-requests" element={<AgentRequestsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="freelancers" element={<FreelancersPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="project-assignments" element={<ProjectAssignmentsPage />} />
          <Route path="qa-reviews" element={<QaReviewsPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="support-articles" element={<SupportArticlesPage />} />
          <Route path="growth-opportunities" element={<GrowthOpportunitiesPage />} />
          <Route path="marketing-insights" element={<MarketingInsightsPage />} />
          <Route path="system-changes" element={<SystemChangesPage />} />
          <Route path="content-posts" element={<ContentPostsPage />} />
          <Route path="content-feedback" element={<ContentFeedbackPage />} />
          <Route path="content-ideas" element={<ContentIdeasPage />} />
          <Route path="marketing-campaigns" element={<MarketingCampaignsPage />} />
          <Route path="persona-library" element={<PersonaLibraryPage />} />
          <Route path="trend-scanner-logs" element={<TrendScannerLogsPage />} />
          <Route path="campaign-tests" element={<CampaignTestsPage />} />
          <Route path="content-remixes" element={<ContentRemixesPage />} /> {/* ✅ קיים */}
          <Route path="support-requests" element={<SupportRequestsPage />} /> {/* ✅ חדש */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
