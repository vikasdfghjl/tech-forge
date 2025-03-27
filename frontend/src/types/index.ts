export interface Tool {
  id: string;
  name: string;
  description: string;
  upvotes: number;
  wants: number;
  comments: Comment[];
  createdAt: string;
  // Add any other properties your Tool type needs
}

export interface Comment {
  id: string;
  text: string;
  author?: string;
  createdAt: string;
}
