import React, { useState, useEffect } from 'react';
import { Card } from '../components';

// Updated interfaces to match Go backend field names
interface Member {
  ID: number;
  Name: string;
  Email: string;
  PictureURL?: string;
}

interface Team {
  ID: number;
  Name: string;
  LogoURL?: string;
  Members?: Member[];
}

interface Feedback {
  ID: number;           // Backend uses uppercase ID
  Content: string;      // Backend uses Content, not feedback_text
  TargetID: number;     // Backend uses TargetID, not target_id
  TargetType: string;   // Backend uses TargetType, not target_type
  CreatedAt?: string;   // Backend uses CreatedAt
  UpdatedAt?: string;   // Backend uses UpdatedAt
}

const ListFeedbacks: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'member' | 'team'>('all');
  const [selectedId, setSelectedId] = useState<string>('');

  // Fetch members and teams for dropdowns
  useEffect(() => {
    const fetchMembersAndTeams = async () => {
      try {
        const [membersResponse, teamsResponse] = await Promise.all([
          fetch('http://localhost:8080/members/'),
          fetch('http://localhost:8080/teams/')
        ]);

        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData);
        }

        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        }
      } catch (err) {
        console.error('Error fetching members/teams:', err);
      }
    };

    fetchMembersAndTeams();
  }, []);

  // Fetch feedbacks based on filter
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = 'http://localhost:8080/feedback/'; // Note: your backend uses /feedback/, not /feedbacks
        const params = new URLSearchParams();
        
        if (filterType === 'member' && selectedId) {
          params.append('member_id', selectedId);
        } else if (filterType === 'team' && selectedId) {
          params.append('team_id', selectedId);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log(`Fetching from: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data: Feedback[] = await response.json();
        console.log('Feedbacks data:', data);
        setFeedbacks(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch feedbacks.');
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [filterType, selectedId]);

  // Get target name for display
  const getTargetName = (feedback: Feedback): string => {
    if (feedback.TargetType === 'member') {
      const member = members.find(m => m.ID === feedback.TargetID);
      return member ? `${member.Name} (${member.Email})` : `Member ID ${feedback.TargetID}`;
    } else if (feedback.TargetType === 'team') {
      const team = teams.find(t => t.ID === feedback.TargetID);
      return team ? team.Name : `Team ID ${feedback.TargetID}`;
    }
    return `${feedback.TargetType} ID ${feedback.TargetID}`;
  };

  return (
    <Card title="View Feedbacks">
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Filter by:</label>
          <select 
            value={filterType} 
            onChange={(e) => {
              setFilterType(e.target.value as 'all' | 'member' | 'team');
              setSelectedId(''); // Reset selection when changing filter type
            }} 
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="all">All Feedbacks</option>
            <option value="member">By Team Member</option>
            <option value="team">By Team</option>
          </select>
        </div>
        
        {filterType === 'member' && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Member:</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">--All Members--</option>
              {members.map(member => (
                <option key={member.ID} value={member.ID}>
                  {member.Name} ({member.Email})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {filterType === 'team' && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Select Team:</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">--All Teams--</option>
              {teams.map(team => (
                <option key={team.ID} value={team.ID}>
                  {team.Name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && <p>Loading feedbacks...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!loading && !error && (
        <div>
          {feedbacks.length === 0 ? (
            <p>No feedbacks found for the current filter.</p>
          ) : (
            <div>
              <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} found
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {feedbacks.map((fb) => (
                  <div 
                    key={fb.ID} 
                    style={{ 
                      padding: '1rem', 
                      border: '1px solid #eee', 
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Target:</strong> {getTargetName(fb)}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Feedback:</strong>
                      <div style={{ 
                        marginTop: '0.25rem', 
                        padding: '0.5rem', 
                        backgroundColor: 'white', 
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}>
                        {fb.Content}
                      </div>
                    </div>
                    {fb.CreatedAt && (
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        <strong>Date:</strong> {new Date(fb.CreatedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ListFeedbacks;