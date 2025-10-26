export interface Member {
  id: string;
  name: string;
  phone?: string;
  email: string;
  role?: 'admin' | 'member';
  avatar?: string;
}

export interface User {
  email: string;
  password: string;
  memberId: string;
}

export interface ScheduleDay {
  id: string;
  dayName: string;
  event: string;
  doorkeepers: Member[];
  hymnSingers: Member[];
  active: boolean;
}

export type Schedule = ScheduleDay[];