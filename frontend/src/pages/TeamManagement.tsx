import React, { useState, useEffect } from 'react';
import { Button, Card } from '../components';
import { toast } from 'react-toastify';

// Updated interfaces to match Go backend field names
interface TeamMember {
  ID: number;          // Changed from id to ID
  Name: string;        // Changed from name to Name
  Email: string;       // Email stays the same
  PictureURL?: string; // Changed from picture_url to PictureURL
}

interface Team {
  ID: number;          // Changed from id to ID
  Name: string;        // Changed from name to Name
  LogoURL?: string;    // Changed from logo_url to LogoURL
  Members?: TeamMember[]; // Added Members array
}

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch all teams
  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/teams/');
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
      const data: Team[] = await response.json();
      console.log('Teams data:', data);
      setTeams(data);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.message || 'Failed to fetch teams.');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific team with members
  const fetchTeamWithMembers = async (teamId: string) => {
    if (!teamId) {
      setSelectedTeam(null);
      return;
    }

    setActionError(null);
    setActionMessage(null);
    
    try {
      const response = await fetch(`http://localhost:8080/teams/${teamId}/`);
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
      const teamData: Team = await response.json();
      console.log('Team with members:', teamData);
      setSelectedTeam(teamData);
    } catch (err: any) {
      console.error('Error fetching team details:', err);
      setActionError(err.message || 'Failed to fetch team details.');
      setSelectedTeam(null);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchTeamWithMembers(selectedTeamId);
  }, [selectedTeamId]);

  const handleRemoveMember = async (teamId: number, memberId: number) => {
    setActionError(null);
    setActionMessage(null);
    
    if (!window.confirm('Are you sure you want to remove this member from the team?')) return;

    try {
      // Using the correct backend route: /teams/:id/remove/:member_id
      const response = await fetch(`http://localhost:8080/teams/${teamId}/remove/${memberId}`, {
        method: 'DELETE',
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
      toast.success(result.message || 'Member removed successfully!');
      setActionMessage('Member removed successfully.');
      
      // Refresh the selected team data
      fetchTeamWithMembers(selectedTeamId);
    } catch (err: any) {
      console.error('Error removing member:', err);
      setActionError(err.message);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    setActionError(null);
    setActionMessage(null);
    
    if (!window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;

    try {
      const response = await fetch(`http://localhost:8080/teams/${teamId}/`, {
        method: 'DELETE',
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

      toast.success('Team deleted successfully!');
      setActionMessage('Team deleted successfully.');
      setSelectedTeam(null);
      setSelectedTeamId('');
      
      // Refresh teams list
      fetchTeams();
    } catch (err: any) {
      console.error('Error deleting team:', err);
      setActionError(err.message);
    }
  };

  if (loading) {
    return (
      <Card title="Team Management">
        <p>Loading teams...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Team Management">
        <p style={{ color: 'red' }}>Error: {error}</p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Card title="Team Management">
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="team-select" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Select Team:
          </label>
          <select
            id="team-select"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">--Select a team--</option>
            {teams.map(team => (
              <option key={team.ID} value={team.ID}>
                {team.Name}
              </option>
            ))}
          </select>
          <small style={{ color: '#666' }}>
            {teams.length === 0 ? 'No teams found. Please create some teams first.' : `${teams.length} teams available`}
          </small>
        </div>

        {actionError && <p style={{ color: 'red' }}>Error: {actionError}</p>}
        {actionMessage && <p style={{ color: 'green' }}>{actionMessage}</p>}
      </Card>

      {selectedTeam && (
        <Card title={`Team: ${selectedTeam.Name}`}>
          <div style={{ marginBottom: '1rem' }}>
            <h4>Team Members</h4>
            {selectedTeam.Members && selectedTeam.Members.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gap: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr auto', 
                  gap: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #ddd'
                }}>
                  <span>Name</span>
                  <span>Email</span>
                  <span>Action</span>
                </div>
                
                {/* Member rows */}
                {selectedTeam.Members.map((member) => (
                  <div 
                    key={member.ID}
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr auto', 
                      gap: '1rem',
                      padding: '0.75rem',
                      borderBottom: '1px solid #eee',
                      alignItems: 'center'
                    }}
                  >
                    <span>{member.Name}</span>
                    <span>{member.Email}</span>
                    <Button
                      onClick={() => handleRemoveMember(selectedTeam.ID, member.ID)}
                      style={{ 
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ 
                padding: '1rem', 
                backgroundColor: '#f9f9f9', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontStyle: 'italic',
                color: '#666'
              }}>
                No members in this team.
              </p>
            )}
          </div>

          <hr style={{ margin: '1.5rem 0', borderColor: '#ddd' }} />
          
          <div>
            <h4 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>Danger Zone</h4>
            <Button
              onClick={() => handleDeleteTeam(selectedTeam.ID)}
              style={{ 
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Delete Team "{selectedTeam.Name}"
            </Button>
            <p style={{ 
              fontSize: '0.9em', 
              color: '#666', 
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              This action cannot be undone. All team assignments will be removed.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeamManagement;