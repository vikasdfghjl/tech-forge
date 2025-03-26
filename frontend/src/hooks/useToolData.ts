export interface Tool {
  id?: string;
  _id?: string;  // MongoDB uses _id
  name: string;
  description: string;
  upvotes: number;
  wants: number;
  comments?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id?: string;
  _id?: string;  // MongoDB uses _id
  text: string;
  createdAt?: string;
}

// ...rest of the file
