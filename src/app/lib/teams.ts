export interface Team {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface TeamsConfig {
  teams: Team[];
}

export const loadTeams = async (): Promise<Team[]> => {
  try {
    const response = await fetch('/teams.json');
    if (response.ok) {
      const data: TeamsConfig = await response.json();
      return data.teams;
    }
  } catch (error) {
    console.error('Failed to load teams:', error);
  }
  
  // Return default teams if loading fails
  return [
    {
      id: 'red-alliance',
      name: 'Red Alliance',
      primaryColor: '#DC2626',
      secondaryColor: '#991B1B'
    },
    {
      id: 'blue-alliance', 
      name: 'Blue Alliance',
      primaryColor: '#2563EB',
      secondaryColor: '#1E40AF'
    }
  ];
};