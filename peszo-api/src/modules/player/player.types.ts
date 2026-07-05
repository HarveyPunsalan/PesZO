export interface UpdateProfileInput {
  email?: string;
}

export interface PlayerProfile {
  id: string;
  email: string;
  createdAt: Date;
}
