import React, { useState, useEffect } from 'react';
import { Button, Card } from '../components';
import { toast } from 'react-toastify';

// Updated interfaces to match the actual Go struct field names
interface Member {
  ID: number;        // Changed from id to ID
  Name: string;      // Changed from name to Name
  Email: string;     // Email stays the same
  PictureURL?: string; // Changed from picture_url to PictureURL
}

interface Team {
  ID: number;        // Changed from id to ID
  Name: string;      // Changed from name to Name
  LogoURL?: string;  // Changed from logo_url to LogoURL
  Members?: Member[]; // Added Members array that Go returns
}

const GiveFeedback: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState<'member' | 'team'>('member');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [targets, setTargets] = useState<Member[] | Team[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTargets = async () => {
      setError(null);
      setLoading(true);
      setSelectedTargetId('');
      
      try {
        console.log(`Fetching ${feedbackType}s...`);
        
        let response;
        if (feedbackType === 'member') {
          response = await fetch('http://localhost:8080/members/');
        } else {
          response = await fetch('http://localhost:8080/teams/');
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch ${feedbackType}s: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`${feedbackType} data:`, data);
        setTargets(data);
      } catch (err: any) {
        console.error(`Error fetching ${feedbackType}s:`, err);
        setError(err.message || `An unknown error occurred while fetching ${feedbackType}s.`);
        setTargets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [feedbackType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!selectedTargetId || !feedbackText.trim()) {
      setError('Please select a target and enter feedback.');
      return;
    }

    // Based on your test files, the backend expects this format:
    const feedbackData = {
      content: feedbackText,        // Backend expects 'content'
      targetid: parseInt(selectedTargetId, 10),  // Backend expects 'targetid'
      targettype: feedbackType      // Backend expects 'targettype'
    };

    try {
      console.log('Submitting feedback:', feedbackData);
      
      const response = await fetch('http://localhost:8080/feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
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
      toast.success('Feedback submitted successfully!', { autoClose: 3000 });
      setSelectedTargetId('');
      setFeedbackText('');
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback.');
    }
  };

  if (loading) {
    return (
      <Card title="Give Feedback">
        <p>Loading {feedbackType}s...</p>
      </Card>
    );
  }

  return (
    <Card title="Give Feedback">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Give feedback to:
          </label>
          <select
            value={feedbackType}
            onChange={(e) => {
              setFeedbackType(e.target.value as 'member' | 'team');
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="member">Team Member</option>
            <option value="team">Team</option>
          </select>
        </div>

        <div>
          <label htmlFor="target-select" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Select {feedbackType === 'member' ? 'Team Member' : 'Team'}:
          </label>
          <select
            id="target-select"
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">--Select a {feedbackType === 'member' ? 'member' : 'team'}--</option>
            {targets.map((target: any, index) => (
              <option key={`${feedbackType}-${target.ID || index}`} value={target.ID}>
                {target.Name}
                {feedbackType === 'member' && target.Email && ` (${target.Email})`}
              </option>
            ))}
          </select>
          <small style={{ color: '#666' }}>
            {targets.length === 0 
              ? `No ${feedbackType}s found. Please add some ${feedbackType}s first.` 
              : `${targets.length} ${feedbackType}s available`}
          </small>
        </div>

        <div>
          <label htmlFor="feedback-text" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Your Feedback:
          </label>
          <textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
            rows={4}
            style={{ 
              width: '100%', 
              padding: '0.5rem', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder={`Enter your feedback for the selected ${feedbackType}...`}
          />
          <small style={{ color: '#666' }}>
            {feedbackText.length}/500 characters
          </small>
        </div>

        <Button type="submit" disabled={!selectedTargetId || !feedbackText.trim()}>
          Submit Feedback
        </Button>
      </form>
    </Card>
  );
};

export default GiveFeedback;