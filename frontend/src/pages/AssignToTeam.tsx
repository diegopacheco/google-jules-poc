import React, { useState, useEffect } from 'react';
import { Button, Card } from '../components';
import { toast } from 'react-toastify';

interface Member {
  id: number;
  name: string;
  email: string;
  picture_url?: string;
}

interface Team {
  id: number;
  name: string;
  logo_url?: string;
}

const AssignToTeam: React.FC = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMembersAndTeams = async () => {
      setError(null);
      setLoading(true);
      
      try {
        console.log('Fetching members and teams...');
        
        const membersResponse = await fetch('http://localhost:8080/members/');
        console.log('Members response:', membersResponse);
        
        if (!membersResponse.ok) {
          throw new Error(`Failed to fetch members: ${membersResponse.status} ${membersResponse.statusText}`);
        }
        const membersData: Member[] = await membersResponse.json();
        console.log('Members data detailed:', JSON.stringify(membersData, null, 2));
        setMembers(membersData);

        const teamsResponse = await fetch('http://localhost:8080/teams/');
        console.log('Teams response:', teamsResponse);
        
        if (!teamsResponse.ok) {
          throw new Error(`Failed to fetch teams: ${teamsResponse.status} ${teamsResponse.statusText}`);
        }
        const teamsData: Team[] = await teamsResponse.json();
        console.log('Teams data detailed:', JSON.stringify(teamsData, null, 2));
        setTeams(teamsData);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An unknown error occurred while fetching data.');
        setMembers([]);
        setTeams([]);
      } finally {
        setLoading(false);
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
      // Using the correct endpoint format from your backend: /teams/:id/assign/:member_id
      const response = await fetch(`http://localhost:8080/teams/${selectedTeamId}/assign/${selectedMemberId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status} - ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Success:', result);
      toast.success(result.message || 'Member assigned to team successfully!', { autoClose: 3000 });
      setSelectedMemberId('');
      setSelectedTeamId('');
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setError(err.message || 'Failed to assign member to team.');
    }
  };

  if (loading) {
    return (
      <Card title="Assign Member to Team">
        <p>Loading members and teams...</p>
      </Card>
    );
  }

  return (
    <Card title="Assign Member to Team">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div>
          <label htmlFor="member-select" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Select Member:
          </label>
          <select
            id="member-select"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">--Select a member--</option>
            {members.map((member, index) => {
              // Add debugging info
              console.log(`Member ${index}:`, member, 'ID:', member.id, 'Type:', typeof member.id);
              return (
                <option key={`member-${member.id || index}`} value={member.id}>
                  {member.name} ({member.email})
                </option>
              );
            })}
          </select>
          <small style={{ color: '#666' }}>
            {members.length === 0 ? 'No members found. Please add some members first.' : `${members.length} members available`}
          </small>
        </div>

        <div>
          <label htmlFor="team-select" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Select Team:
          </label>
          <select
            id="team-select"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">--Select a team--</option>
            {teams.map((team, index) => {
              // Add debugging info
              console.log(`Team ${index}:`, team, 'ID:', team.id, 'Type:', typeof team.id);
              return (
                <option key={`team-${team.id || index}`} value={team.id}>
                  {team.name}
                </option>
              );
            })}
          </select>
          <small style={{ color: '#666' }}>
            {teams.length === 0 ? 'No teams found. Please create some teams first.' : `${teams.length} teams available`}
          </small>
        </div>

        <Button type="submit" disabled={!selectedMemberId || !selectedTeamId}>
          Assign to Team
        </Button>
      </form>
    </Card>
  );
};

export default AssignToTeam;