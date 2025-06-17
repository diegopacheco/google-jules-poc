import React, { useState, useEffect } from 'react';
import { Card } from '../components'; // Assuming a Card component exists

// Define interfaces for structured data
interface Feedback {
  id: number;
  target_id: number;
  target_type: 'member' | 'team';
  feedback_text: string;
  giver_id?: number; // Optional, depending on your data model
  created_at?: string; // Optional
  // Add any other relevant fields from your Feedback model
  target_name?: string; // To display member/team name
}

const ListFeedbacks: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'member' | 'team'>('all');
  const [filterId, setFilterId] = useState<string>(''); // For member_id or team_id

  // TODO: Fetch feedbacks from the backend
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError(null);
      let url = '/api/feedbacks'; // Base URL
      const params = new URLSearchParams();
      if (filterType !== 'all' && filterId) {
        if (filterType === 'member') {
          params.append('member_id', filterId);
        } else if (filterType === 'team') {
          params.append('team_id', filterId);
        }
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      try {
        console.log(`Fetching from: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" })); // Gracefully handle if errorData is not JSON
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: Feedback[] = await response.json();
        // Note: The backend currently doesn't provide target_name.
        // The UI will fallback to "target_type ID target_id".
        // For a richer display, target_name would need to be fetched separately or included by the backend.
        setFeedbacks(data);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch feedbacks.');
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [filterType, filterId]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fetching is triggered by useEffect dependencies [filterType, filterId]
    // So, this function is mainly to prevent default form submission behavior
    // if we wrap filter controls in a <form> element.
    // If not using a <form>, this explicit submit handler might not be strictly necessary
    // if state updates directly trigger the useEffect.
    console.log("Applying filters:", { filterType, filterId });
  };


  return (
    <Card title="View Feedbacks">
      {/* TODO: Add filter UI elements */}
      <form onSubmit={handleFilterSubmit} style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as 'all' | 'member' | 'team')} style={{ padding: '0.5rem' }}>
          <option value="all">All Feedbacks</option>
          <option value="member">By Member ID</option>
          <option value="team">By Team ID</option>
        </select>
        {(filterType === 'member' || filterType === 'team') && (
          <input
            type="text" // Could be number, but string is more flexible for input handling
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            placeholder={filterType === 'member' ? 'Enter Member ID' : 'Enter Team ID'}
            style={{ padding: '0.5rem' }}
          />
        )}
        {/* <Button type="submit">Apply Filters</Button> */} {/* Button might not be needed if useEffect handles changes */}
      </form>

      {loading && <p>Loading feedbacks...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && (
        <div>
          {feedbacks.length === 0 ? (
            <p>No feedbacks found for the current filter.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {feedbacks.map((fb) => (
                <li key={fb.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
                  <p><strong>Feedback ID:</strong> {fb.id}</p>
                  <p><strong>Target:</strong> {fb.target_name || `${fb.target_type} ID ${fb.target_id}`}</p>
                  <p><strong>Feedback:</strong> {fb.feedback_text}</p>
                  {fb.giver_id && <p><strong>Giver ID:</strong> {fb.giver_id}</p>}
                  {fb.created_at && <p><strong>Date:</strong> {new Date(fb.created_at).toLocaleString()}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
};

export default ListFeedbacks;
