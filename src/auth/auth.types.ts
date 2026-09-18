export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
