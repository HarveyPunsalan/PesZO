export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
