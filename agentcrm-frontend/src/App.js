import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import MainLayout from './layout/MainLayout';
import ContactsPage from './pages/ContactsPage';
import LeadsPage from './pages/LeadsPage';
import TasksPage from './pages/TasksPage';
import MeetingsPage from './pages/MeetingsPage';
import QuotesPage from './pages/QuotesPage';
import PaymentsPage from './pages/PaymentsPage';
import AgentRequestsPage from './pages/AgentRequestsPage'; // ✅ חדש
import UsersPage from './pages/UsersPage'; // ✅ אם יש גם ניהול משתמשים

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
          <Route path="users" element={<UsersPage />} /> {/* אופציונלי */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
