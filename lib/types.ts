export interface Album {
  id: string;
  name: string;
  coverPhoto?: string;
  photos: string[];
}

export interface Shoot {
  id: number;
  photographerId: string;
  name: string;
  date: string;
  clientName: string;
  clientEmail: string;
  password: string;
  photos: string[];
  coverPhoto?: string;
  albums?: Album[];
  selections: string[];
  selectionSubmitted?: boolean;
  status?: 'klaar';
}

export interface PhotographerUser {
  id: string;
  name: string;
  email: string;
  password: string;
  registeredAt: string;
  isActive: boolean;
}
