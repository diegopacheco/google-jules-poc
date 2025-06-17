import React, { useState, useEffect } from 'react';
import { Button, Card } from '../components';
import { toast } from 'react-toastify';

interface Target { // Assuming backend sends numeric IDs for both members and teams
  id: number;
  name: string;
}

const GiveFeedback: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState<'member' | 'team'>('member');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(''); // Keep as string for select value
  const [feedbackText, setFeedbackText] = useState('');
  const [targets, setTargets] = useState<Target[]>([]);
  const [message, setMessage] = useState<string | null>(null); // For general messages
  const [error, setError] = useState<string | null>(null); // For displaying fetch or submission errors

  useEffect(() => {
    const fetchTargets = async () => {
      setError(null);
      setTargets([]); // Clear previous targets
      setSelectedTargetId(''); // Reset selection
      try {
        let response;
        if (feedbackType === 'member') {
          response = await fetch('http://localhost:8080/members');
        } else { // feedbackType === 'team'
          response = await fetch('http://localhost:8080/teams');
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch ${feedbackType}s: ${response.statusText}`);
        }
        const data: Target[] = await response.json();
        setTargets(data);
      } catch (err: any) {
        setError(err.message || `An unknown error occurred while fetching ${feedbackType}s.`);
        setTargets([]);
      }
    };

    fetchTargets();
  }, [feedbackType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!selectedTargetId || !feedbackText) {
      setError('Please select a target and enter feedback.');
      return;
    }

    const feedbackData = {
      target_id: parseInt(selectedTargetId, 10), // Ensure target_id is a number if backend expects int
      target_type: feedbackType,
      feedback_text: feedbackText,
      // Assuming 'giver_id' would be handled by the backend (e.g., from auth session)
      // Or you might need to add it here if required by the API.
    };

    try {
      const response = await fetch('http://localhost:8080/feedback', { // Assuming '/api' prefix
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      toast.success('Feedback submitted successfully!', { autoClose: 3000 });
      // setMessage('Feedback submitted successfully!'); // Optionally remove
      setSelectedTargetId('');
      setFeedbackText('');
      // feedbackType remains as is, or you could reset it
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback.');
    }
  };

  return (
    <Card title="Give Feedback">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Feedback For:</label>
          <select
            value={feedbackType}
            onChange={(e) => {
              setFeedbackType(e.target.value as 'member' | 'team');
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem' }}
          >
            <option value="member">Member</option> {/* Changed from Person to Member */}
            <option value="team">Team</option>
          </select>
        </div>

        <div>
          <label htmlFor="target-select" style={{ display: 'block', marginBottom: '0.5rem' }}>Select {feedbackType === 'member' ? 'Member' : 'Team'}:</label>
          <select
            id="target-select"
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="" disabled>--Select a {feedbackType === 'member' ? 'Member' : 'Team'}--</option>
            {targets.map(target => <option key={target.id} value={target.id}>{target.name}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="feedback-text" style={{ display: 'block', marginBottom: '0.5rem' }}>Feedback:</label>
          <textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <Button type="submit">Submit Feedback</Button>
      </form>
    </Card>
  );
};

export default GiveFeedback;
