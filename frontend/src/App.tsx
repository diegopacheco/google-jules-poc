import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AddTeamMember, CreateTeam, AssignToTeam, GiveFeedback } from './pages';

const AppNav: React.FC = () => (
  <nav style={{ marginBottom: '2rem', backgroundColor: '#f0f0f0', padding: '1rem' }}>
    <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'space-around', margin: 0, padding: 0 }}>
      <li><Link to="/add-member">Add Team Member</Link></li>
      <li><Link to="/create-team">Create Team</Link></li>
      <li><Link to="/assign-to-team">Assign to Team</Link></li>
      <li><Link to="/give-feedback">Give Feedback</Link></li>
    </ul>
  </nav>
);

function App() {
  return (
    <Router>
      <AppNav />
      <div style={{ padding: '0 2rem' }}>
        <Routes>
          <Route path="/add-member" element={<AddTeamMember />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/assign-to-team" element={<AssignToTeam />} />
          <Route path="/give-feedback" element={<GiveFeedback />} />
          <Route path="/" element={
            <div>
              <h1>Welcome to the Coaching Application!</h1>
              <p>Select an option from the navigation bar to get started.</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
