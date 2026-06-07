export interface User {
  id: string;
  email: string;
  slug?: string;
  displayName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  messageToReaders?: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  image?: string;
  order: number;
  clicks: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
