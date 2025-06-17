import React, { useState } from 'react';
import { Input, Button, Card } from '../components';
import { toast } from 'react-toastify';

const AddTeamMember: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [picture, setPicture] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (picture) {
      formData.append('picture_url', picture.name); // Sending file name as picture_url for now
      // Ideally, you would upload the file to a server and store the URL.
      // For simplicity, we are sending the file name.
      // If your backend is set up to handle file uploads directly,
      // you would append the file itself: formData.append('pictureFile', picture);
    }

    try {
      const response = await fetch('http://localhost:8080/members', { // Assuming '/api' prefix for backend
        method: 'POST',
        body: formData, // FormData will set the Content-Type to multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      toast.success('Team member added successfully!', { autoClose: 3000 });
      // setMessage('Team member added successfully!'); // Optionally remove if toast is sufficient
      setName('');
      setEmail('');
      setPicture(null);
      const fileInput = document.getElementById('picture-input') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = '';
      }
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
