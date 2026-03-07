const API_URL = 'http://localhost:3000/api';

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
