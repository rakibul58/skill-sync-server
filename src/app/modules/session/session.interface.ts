import { SessionStatus } from "@prisma/client";

export interface CalendarFilterRequest {
  startDate: Date;
  endDate: Date;
  status?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  extendedProps: {
    status: string;
    teacherId?: string;
    teacherName?: string;
    learnerId?: string;
    learnerName?: string;
    skillId: string;
    skillName: string;
  };
}

export interface CreateSessionBody {
  teacherId: string;
  learnerId: string;
  skillId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
}

export interface UpdateSessionBody {
  status?: SessionStatus;
  notes?: string;
}

export interface SessionFilterRequest {
  status?: SessionStatus;
  teacherId?: string;
  learnerId?: string;
  skillId?: string;
  startDate?: Date;
  endDate?: Date;
}
