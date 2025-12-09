
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

export interface ScheduleParticipant {
  id: string; // member.id for registered, unique string for unregistered
  name: string;
  isRegistered: boolean;
  memberData?: Member; // Contains full member object if registered
}


export interface ScheduleDay {
  id: string;
  dayName: string;
  event: string;
  doorkeepers: ScheduleParticipant[];
  hymnSingers: ScheduleParticipant[];
  worshipLeaders: ScheduleParticipant[];
  preachers: ScheduleParticipant[];
  active: boolean;
}

export type Schedule = ScheduleDay[];

export interface ScheduleGroup {
  id: string;
  name: string;
  schedule: Schedule;
  announcements: string;
}
