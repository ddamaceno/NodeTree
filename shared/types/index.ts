export interface User {
  id: string;
  email: string;
  password: string;
  slug?: string;
  displayName?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
