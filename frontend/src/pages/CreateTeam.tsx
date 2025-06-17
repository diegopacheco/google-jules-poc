import React, { useState } from 'react';
import { Input, Button, Card } from '../components';

const CreateTeam: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ teamName, teamLogo });
    setTeamName('');
    setTeamLogo(null);
    const fileInput = document.getElementById('team-logo-input') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  return (
    <Card title="Create New Team">
      <form onSubmit={handleSubmit}>
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
