import React, { useState, useEffect } from 'react';
import { Button, Card } from '../components';
import { toast } from 'react-toastify';

// Updated interfaces to match Go backend field names
interface TeamMember {
  ID: number;          // Changed from id to ID
  Name: string;        // Changed from name to Name
  Email: string;       // Email stays the same
  PictureURL?: string; // Changed from picture_url to PictureURL
}

interface Team {
  ID: number;          // Changed from id to ID
  Name: string;        // Changed from name to Name
  LogoURL?: string;    // Changed from logo_url to LogoURL
  Members?: TeamMember[]; // Added Members array
}

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch all teams
  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/teams/');
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
      const data:// filepath: /mnt/e35d88d4-42b9-49ea-bf29-c4c3b018d429/diego/git/diegopacheco/google-jules-poc/frontend/src/pages/TeamManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button, Card } from '../components';
import { toast } from 'react-toastify';

// Updated interfaces to match Go backend field names
interface TeamMember {
  ID: number;          // Changed from id to ID
  Name: string;        // Changed from name to Name
  Email: string;       // Email stays the same
  PictureURL?: string; // Changed from picture_url to PictureURL
}

interface Team {
  ID: number;          // Changed from id to ID
  Name: string;        // Changed from name to Name
  LogoURL?: string;    // Changed from logo_url to LogoURL
  Members?: TeamMember[]; // Added Members array
}

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch all teams
  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/teams/');
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
      const data: