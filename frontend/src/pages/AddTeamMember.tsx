import React, { useState } from 'react';
import { Input, Button, Card } from '../components';

const AddTeamMember: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [picture, setPicture] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ name, email, picture });
    setName('');
    setEmail('');
    setPicture(null);
    // Clear the file input if needed (requires a ref or more complex state)
    const fileInput = document.getElementById('picture-input') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  };

  return (
    <Card title="Add New Team Member">
      <form onSubmit={handleSubmit}>
        <Input
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Picture"
          type="file"
          id="picture-input"
          accept="image/*"
          onChange={(e) => setPicture(e.target.files ? e.target.files[0] : null)}
        />
        <Button type="submit">Add Member</Button>
      </form>
    </Card>
  );
};

export default AddTeamMember;
