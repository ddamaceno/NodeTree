const API_URL = 'http://localhost:3001/api';

export interface LinkData {
  title: string;
  url: string;
  userId: string;
  order?: number;
}

export interface Link extends LinkData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  slug: string | null;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  avatar: string | null;
  theme: string;
}

export const createLink = async (data: LinkData) => {
  const response = await fetch(`${API_URL}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getLinksByUser = async (userId: string): Promise<Link[]> => {
  const response = await fetch(`${API_URL}/links?userId=${userId}`);
  return response.json();
};

export interface UpdateLinkData {
  title?: string;
  url?: string;
}

export const updateLink = async (id: string, data: UpdateLinkData): Promise<Link> => {
  const response = await fetch(`${API_URL}/links/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteLink = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/links/${id}`, {
    method: 'DELETE',
  });
};

export const reorderLinks = async (orderedIds: string[]): Promise<void> => {
  await fetch(`${API_URL}/links/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${API_URL}/users/me`);
  return response.json();
};

export interface UpdateUserData {
  displayName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  theme?: string;
}

export const updateCurrentUser = async (data: UpdateUserData): Promise<User> => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const uploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};
