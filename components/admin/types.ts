import type { Shoot } from '@/lib/types';

export type View = 'auth' | 'dashboard' | 'detail' | 'new' | 'settings';

export interface AdminState {
  view: View;
  shoots: Shoot[];
  currentShoot: Shoot | null;
}

export type { Shoot };
