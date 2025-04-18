import { createContext } from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  dateOfBirth?: Date | string;
  gender?: string;
  country?: string;
  bookmarkedTools?: string[];
  upvotedTools?: string[];
  wantedTools?: string[];
  createdAt?: string; // Add createdAt for displaying join date
  bio?: string; // Add bio for user profile
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (
    name: string, 
    email: string, 
    password: string, 
    username?: string, 
    dateOfBirth?: string, 
    gender?: string, 
    country?: string
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  getUser: (username: string) => Promise<User & { isCurrentUser?: boolean }>; // Add getUser function
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);