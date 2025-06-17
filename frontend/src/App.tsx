import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AddTeamMember, CreateTeam, AssignToTeam, GiveFeedback, ListFeedbacks, TeamManagement } from './pages'; // Added ListFeedbacks and TeamManagement
import logo from '/logo-app.png'; // Import the logo
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppNav: React.FC = () => (
  <nav style={{ marginBottom: '2rem', backgroundColor: '#f0f0f0', padding: '1rem', display: 'flex', alignItems: 'center' }}>
    <img src={logo} alt="App Logo" style={{ height: '40px', marginRight: '20px' }} />
    <ul style={{ listStyle: 'none', display: 'flex', flexGrow: 1, justifyContent: 'space-around', margin: 0, padding: 0 }}>
      <li><Link to="/add-member">Add Team Member</Link></li>
      <li><Link to="/create-team">Create Team</Link></li>
      <li><Link to="/assign-to-team">Assign to Team</Link></li>
      <li><Link to="/give-feedback">Give Feedback</Link></li>
      <li><Link to="/feedbacks">View Feedbacks</Link></li> {/* Added link to View Feedbacks */}
      <li><Link to="/team-management">Team Management</Link></li> {/* Added link to Team Management */}
    </ul>
  </nav>
);

function App() {
  return (
    <Router>
      <AppNav />
      <ToastContainer
        position="top-right"
        autoClose={5000} // Default autoClose time, can be overridden per toast
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div style={{ padding: '0 2rem' }}>
        <Routes>
          <Route path="/add-member" element={<AddTeamMember />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/assign-to-team" element={<AssignToTeam />} />
          <Route path="/give-feedback" element={<GiveFeedback />} />
          <Route path="/feedbacks" element={<ListFeedbacks />} /> {/* Added route for ListFeedbacks */}
          <Route path="/team-management" element={<TeamManagement />} /> {/* Added route for TeamManagement */}
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
