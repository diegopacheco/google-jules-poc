import React, { useState } from 'react';
import { Input, Button, Card } from '../components';
import { toast } from 'react-toastify';

const CreateTeam: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const teamData = {
      name: teamName,
      logo_url: logoUrl
    };

    try {
      const response = await fetch('http://localhost:8080/teams/', {  // Added trailing slash
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
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
      toast.success('Team created successfully!', { autoClose: 3000 });
      setTeamName('');
      setLogoUrl('');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to create team.');
    }
  };

  return (
    <Card title="Create New Team">
      <form onSubmit={handleSubmit}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <Input
          label="Team Name"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
        <Input
          label="Team Logo URL"
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
        <Button type="submit">Create Team</Button>
      </form>
    </Card>
  );
};

export default CreateTeam;