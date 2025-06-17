import React, { useState, useEffect } from 'react'; // Added useEffect
import { Button, Card } from '../components';
import { toast } from 'react-toastify';

// Updated interfaces to expect numeric IDs, common in backend responses
interface Member {
  id: number;
  name: string;
  // Add other fields like email if needed for display, though not strictly for assignment
}

interface Team {
  id: number;
  name: string;
  // Add other fields like logo_url if needed
}

const AssignToTeam: React.FC = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(''); // Keep as string for select value
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');   // Keep as string for select value
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [message, setMessage] = useState<string | null>(null); // For general messages, if needed
  const [error, setError] = useState<string | null>(null); // For displaying fetch or submission errors

  useEffect(() => {
    const fetchMembersAndTeams = async () => {
      setError(null); // Clear previous errors
      try {
        const membersResponse = await fetch('http://localhost:8080/members');
        if (!membersResponse.ok) {
          throw new Error(`Failed to fetch members: ${membersResponse.statusText}`);
        }
        const membersData: Member[] = await membersResponse.json();
        setMembers(membersData);

        const teamsResponse = await fetch('http://localhost:8080/teams');
        if (!teamsResponse.ok) {
          throw new Error(`Failed to fetch teams: ${teamsResponse.statusText}`);
        }
        const teamsData: Team[] = await teamsResponse.json();
        setTeams(teamsData);

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred while fetching data.');
        setMembers([]); // Clear data on error
        setTeams([]);   // Clear data on error
      }
    };

    fetchMembersAndTeams();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!selectedMemberId || !selectedTeamId) {
      setError('Please select a member and a team.');
      return;
    }

    try {
      // The endpoint expects no body for this POST request, just IDs in the URL
      const response = await fetch(`http://localhost:8080/teams/${selectedTeamId}/members/${selectedMemberId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Still good practice to set, even if no body
        },
        // No body for this specific assignment request as per typical REST patterns for associations
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Assuming the backend returns a success message or the updated team/member relation
      const result = await response.json(); // Or response.text() if it's just a message
      console.log('Success:', result);
      toast.success(result.message || 'Member assigned to team successfully!', { autoClose: 3000 });
      // setMessage(result.message || 'Member assigned to team successfully!'); // Optionally remove
      setSelectedMemberId('');
      setSelectedTeamId('');
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setError(err.message || 'Failed to assign member to team.');
    }
  };

  return (
    <Card title="Assign Member to Team">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label htmlFor="member-select" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Member:</label>
          <select
            id="member-select"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="" disabled>--Select a member--</option>
            {members.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="team-select" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Team:</label>
          <select
            id="team-select"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="" disabled>--Select a team--</option>
            {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </div>

        <Button type="submit">Assign to Team</Button>
      </form>
    </Card>
  );
};

export default AssignToTeam;
