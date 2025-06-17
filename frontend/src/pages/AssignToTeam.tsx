import React, { useState } from 'react';
import { Button, Card } from '../components';

const AssignToTeam: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  // Placeholder data - in a real app, this would come from state/API
  const members = ['Alice', 'Bob', 'Charlie'];
  const teams = ['Frontend Wizards', 'Backend Gurus', 'DevOps Dragons'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !selectedTeam) {
      alert('Please select a member and a team.');
      return;
    }
    // Handle assignment logic here
    console.log({ selectedMember, selectedTeam });
    setSelectedMember('');
    setSelectedTeam('');
  };

  return (
    <Card title="Assign Member to Team">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="member-select" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Member:</label>
          <select
            id="member-select"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="" disabled>--Select a member--</option>
            {members.map(member => <option key={member} value={member}>{member}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="team-select" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Team:</label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="" disabled>--Select a team--</option>
            {teams.map(team => <option key={team} value={team}>{team}</option>)}
          </select>
        </div>

        <Button type="submit">Assign to Team</Button>
      </form>
    </Card>
  );
};

export default AssignToTeam;
