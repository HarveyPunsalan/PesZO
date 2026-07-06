export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthOutput {
  user: UserWithoutPassword;
  accessToken: string;
  refreshToken: string;
}
