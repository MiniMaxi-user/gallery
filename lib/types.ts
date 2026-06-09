export interface Shoot {
  id: number;
  name: string;
  date: string;
  clientName: string;
  clientEmail: string;
  password: string;
  photos: string[];
  selections: string[];
  selectionSubmitted?: boolean;
  status?: 'klaar';
}

export interface AppData {
  shoots: Shoot[];
}

export interface PhotographerUser {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  isActive: boolean;
}

export interface PlatformData {
  photographers: PhotographerUser[];
}
