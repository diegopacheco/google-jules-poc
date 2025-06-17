import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '../components'; // Assuming Button and Card components exist

// Interfaces based on existing models (adjust if your models differ)
interface TeamMember {
  id: number;
  name: string;
  email: string;
  picture_url?: string;
}

interface Team {
  id: number;
  name: string;
  logo_url?: string;
  members: TeamMember[];
}

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);
    setActionMessage(null);
    try {
      const response = await fetch('/api/teams'); // Assuming GET /api/teams fetches teams with members
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data: Team[] = await response.json();
      setTeams(data);
      if (selectedTeam) {
        // If a team was selected, refresh its data
        const refreshedSelectedTeam = data.find(t => t.id === selectedTeam.id);
        setSelectedTeam(refreshedSelectedTeam || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teams.');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTeam]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    setActionError(null);
    setActionMessage(null);
  };

  const handleRemoveMember = async (teamId: number, memberId: number) => {
    setActionError(null);
    setActionMessage(null);
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;

    try {
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }
      setActionMessage('Member removed successfully.');
      // Refresh teams data to reflect the change
      fetchTeams();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    setActionError(null);
    setActionMessage(null);
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team');
      }
      setActionMessage('Team deleted successfully.');
      setSelectedTeam(null); // Clear selection as team is gone
      // Refresh teams data
      fetchTeams();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  if (loading) return <p>Loading teams...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <Card title="Teams" style={{ flex: 1 }}>
        {teams.length === 0 ? (
          <p>No teams found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {teams.map((team) => (
              <li key={team.id} onClick={() => handleSelectTeam(team)} style={{ padding: '0.5rem', cursor: 'pointer', backgroundColor: selectedTeam?.id === team.id ? '#e0e0e0' : 'transparent' }}>
                {team.name}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {selectedTeam && (
        <Card title={`Team: ${selectedTeam.name}`} style={{ flex: 2 }}>
          {actionError && <p style={{ color: 'red' }}>Error: {actionError}</p>}
          {actionMessage && <p style={{ color: 'green' }}>{actionMessage}</p>}
          <h4>Members</h4>
          {selectedTeam.members && selectedTeam.members.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {selectedTeam.members.map((member) => (
                <li key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                  <span>{member.name} ({member.email})</span>
                  <Button
                    onClick={() => handleRemoveMember(selectedTeam.id, member.id)}
                    variant="danger" // Assuming Button has a variant prop for styling
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No members in this team.</p>
          )}
          <hr style={{ margin: '1rem 0' }} />
          <Button
            onClick={() => handleDeleteTeam(selectedTeam.id)}
            variant="danger"
            style={{ marginTop: '1rem' }}
          >
            Delete Team "{selectedTeam.name}"
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TeamManagement;
