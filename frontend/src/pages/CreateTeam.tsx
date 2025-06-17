import React, { useState } from 'react';
import { Input, Button, Card } from '../components';
import { toast } from 'react-toastify';

const CreateTeam: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append('name', teamName);
    if (teamLogo) {
      formData.append('logo_url', teamLogo.name); // Sending file name as logo_url for now
      // If your backend handles file uploads:
      // formData.append('logoFile', teamLogo);
    }

    try {
      const response = await fetch('/api/teams', { // Assuming '/api' prefix
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      toast.success('Team created successfully!', { autoClose: 3000 });
      // setMessage('Team created successfully!'); // Optionally remove
      setTeamName('');
      setTeamLogo(null);
      const fileInput = document.getElementById('team-logo-input') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = '';
      }
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
          label="Team Logo"
          id="team-logo-input"
          type="file"
          accept="image/*"
          onChange={(e) => setTeamLogo(e.target.files ? e.target.files[0] : null)}
        />
        <Button type="submit">Create Team</Button>
      </form>
    </Card>
  );
};

export default CreateTeam;
