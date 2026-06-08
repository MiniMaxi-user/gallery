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
