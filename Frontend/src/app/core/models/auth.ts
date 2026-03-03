export enum Role {
  TeamMember = 'TeamMember',
  TeamLead = 'TeamLead',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}
