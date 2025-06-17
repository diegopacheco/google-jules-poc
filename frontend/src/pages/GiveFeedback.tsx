import React, { useState } from 'react';
import { Button, Card } from '../components';

const GiveFeedback: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState<'person' | 'team'>('person');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  // Placeholder data
  const people = ['Alice', 'Bob', 'Charlie'];
  const teams = ['Frontend Wizards', 'Backend Gurus', 'DevOps Dragons'];

  const targets = feedbackType === 'person' ? people : teams;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget || !feedbackText) {
      alert('Please select a target and enter feedback.');
      return;
    }
    // Handle feedback submission logic here
    console.log({ feedbackType, selectedTarget, feedbackText });
    setSelectedTarget('');
    setFeedbackText('');
  };

  return (
    <Card title="Give Feedback">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Feedback For:</label>
          <select
            value={feedbackType}
            onChange={(e) => {
              setFeedbackType(e.target.value as 'person' | 'team');
              setSelectedTarget(''); // Reset target when type changes
            }}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '1rem' }}
          >
            <option value="person">Person</option>
            <option value="team">Team</option>
          </select>
        </div>

        <div>
          <label htmlFor="target-select" style={{ display: 'block', marginBottom: '0.5rem' }}>Select {feedbackType === 'person' ? 'Person' : 'Team'}:</label>
          <select
            id="target-select"
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="" disabled>--Select a {feedbackType}--</option>
            {targets.map(target => <option key={target} value={target}>{target}</option>)}
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
