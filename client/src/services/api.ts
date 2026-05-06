const API_URL = 'http://localhost:3001/api';

const getToken = () => localStorage.getItem('token');

const getHeaders = (includeContentType = true): Record<string, string> => {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export interface LinkData {
  title: string;
  url: string;
  userId: string;
  order?: number;
  description?: string;
}

export interface Link extends LinkData {
  id: string;
  description?: string;
  image?: string;
  clicks?: number;
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
  messageToReaders?: string | null;
}

export const createLink = async (data: LinkData) => {
  const response = await fetch(`${API_URL}/links`, {
    method: 'POST',
    headers: getHeaders(),
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
  description?: string;
}

export const updateLink = async (id: string, data: UpdateLinkData): Promise<Link> => {
  const response = await fetch(`${API_URL}/links/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteLink = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/links/${id}`, {
    method: 'DELETE',
    headers: getHeaders(false),
  });
};

export const reorderLinks = async (orderedIds: string[]): Promise<void> => {
  await fetch(`${API_URL}/links/reorder`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ orderedIds }),
  });
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: getHeaders(false),
  });
  return response.json();
};

export interface UpdateUserData {
  displayName?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  theme?: string;
  messageToReaders?: string;
}

export const updateCurrentUser = async (data: UpdateUserData): Promise<User> => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
};

export const uploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: headers,
    body: formData,
  });
  return response.json();
};
