import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import {
  CalendarFilterRequest,
  CreateSessionBody,
  SessionFilterRequest,
  UpdateSessionBody,
} from "./session.interface";
import { JwtPayload } from "jsonwebtoken";
import { SessionStatus } from "@prisma/client";

const getTeacherCalendarEvents = async (user: JwtPayload) => {
  const sessions = await prisma.session.findMany({
    where: {
      teacherId: user.userId,
      status: "CONFIRMED",
    },
    include: {
      learner: true,
      skill: true,
    },
  });

  return sessions.map((session) => ({
    id: session.id,
    title: `${session.skill.name} with ${session.learner.name}`,
    start: session.startTime,
    end: session.endTime,
    allDay: false,
    extendedProps: {
      status: session.status,
      learnerId: session.learnerId,
      learnerName: session.learner.name,
      skillId: session.skillId,
      skillName: session.skill.name,
    },
  }));
};

const getLearnerCalendarEvents = async (user: JwtPayload) => {
  const sessions = await prisma.session.findMany({
    where: {
      learnerId: user.userId,
      status: "CONFIRMED",
    },
    include: {
      teacher: true,
      skill: true,
    },
  });

  return sessions.map((session) => ({
    id: session.id,
    title: `${session.skill.name} with ${session.teacher.name}`,
    start: session.startTime,
    end: session.endTime,
    allDay: false,
    extendedProps: {
      status: session.status,
      teacherId: session.teacherId,
      teacherName: session.teacher.name,
      skillId: session.skillId,
      skillName: session.skill.name,
    },
  }));
};

const getAdminCalendarEvents = async () => {
  const sessions = await prisma.session.findMany({
    where: {
      status: "CONFIRMED",
    },
    include: {
      teacher: true,
      learner: true,
      skill: true,
    },
  });

  return sessions.map((session) => ({
    id: session.id,
    title: `${session.skill.name}: ${session.teacher.name} - ${session.learner.name}`,
    start: session.startTime,
    end: session.endTime,
    allDay: false,
    extendedProps: {
      status: session.status,
      teacherId: session.teacherId,
      teacherName: session.teacher.name,
      learnerId: session.learnerId,
      learnerName: session.learner.name,
      skillId: session.skillId,
      skillName: session.skill.name,
    },
  }));
};

const createSession = async (data: CreateSessionBody) => {
  // Validate all entities exist
  const [teacher, learner, skill] = await Promise.all([
    prisma.teacher.findUnique({ where: { id: data.teacherId } }),
    prisma.learner.findUnique({ where: { id: data.learnerId } }),
    prisma.skill.findUnique({ where: { id: data.skillId } }),
  ]);

  if (!teacher) throw new AppError(StatusCodes.NOT_FOUND, "Teacher not found");
  if (!learner) throw new AppError(StatusCodes.NOT_FOUND, "Learner not found");
  if (!skill) throw new AppError(StatusCodes.NOT_FOUND, "Skill not found");

  // Validate teacher has the skill
  const teacherSkill = await prisma.userSkill.findUnique({
    where: {
      teacherId_skillId: {
        teacherId: data.teacherId,
        skillId: data.skillId,
      },
    },
  });

  if (!teacherSkill) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Teacher doesn't teach this skill"
    );
  }

  // Check for scheduling conflicts
  const conflictingSession = await prisma.session.findFirst({
    where: {
      OR: [{ teacherId: data.teacherId }, { learnerId: data.learnerId }],
      AND: [
        {
          startTime: {
            lte: data.endTime,
          },
        },
        {
          endTime: {
            gte: data.startTime,
          },
        },
        {
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
      ],
    },
  });

  if (conflictingSession) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Time slot conflicts with existing session"
    );
  }

  const result = await prisma.session.create({
    data,
    include: {
      teacher: true,
      learner: true,
      skill: true,
    },
  });

  return result;
};

const updateSession = async (sessionId: string, data: UpdateSessionBody) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError(StatusCodes.NOT_FOUND, "Session not found");
  }

  if (data.status) {
    const validTransitions: Record<SessionStatus, SessionStatus[]> = {
      PENDING: ["CONFIRMED"],
      CONFIRMED: ["COMPLETED"],
      COMPLETED: [],
    };

    if (!validTransitions[session.status].includes(data.status)) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        `Cannot transition from ${session.status} to ${data.status}`
      );
    }
  }

  const result = await prisma.session.update({
    where: { id: sessionId },
    data,
    include: {
      teacher: true,
      learner: true,
      skill: true,
    },
  });

  return result;
};

export const SessionService = {
  getTeacherCalendarEvents,
  getLearnerCalendarEvents,
  getAdminCalendarEvents,
  createSession,
  updateSession,
};
