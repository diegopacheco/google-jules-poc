import React, { useState } from 'react';
import { Input, Button, Card } from '../components';
import { toast } from 'react-toastify';

const AddTeamMember: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const memberData = {
      name,
      email,
      picture_url: pictureUrl
    };

    try {
      const response = await fetch('http://localhost:8080/members/', {  // Added trailing slash
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memberData),
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
      toast.success('Team member added successfully!', { autoClose: 3000 });
      setName('');
      setEmail('');
      setPictureUrl('');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to add team member.');
    }
  };

  return (
    <Card title="Add New Team Member">
      <form onSubmit={handleSubmit}>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
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
          label="Picture URL"
          type="url"
          value={pictureUrl}
          onChange={(e) => setPictureUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
        />
        <Button type="submit">Add Member</Button>
      </form>
    </Card>
  );
};

export default AddTeamMember;