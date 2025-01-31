import { UserRole } from "@prisma/client";

export interface CreateAdminBody {
  password: string;
  admin: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface UpdateAdminBody {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface CreateTeacherBody {
  password: string;
  teacher: {
    name: string;
    email: string;
    bio?: string;
    expertise?: string;
    yearsOfExperience?: number;
    rating?: number;
    avatar?: string;
    isVerified?: boolean;
  };
}

export interface UpdateTeacherBody {
  name?: string;
  email?: string;
  bio?: string;
  expertise?: string;
  yearsOfExperience?: number;
  avatar?: string;
  isVerified?: boolean;
}

export interface CreateLearnerBody {
  password: string;
  learner: {
    name: string;
    email: string;
    bio?: string;
    interests?: string;
    avatar?: string;
  };
}

export interface UpdateLearnerBody {
  name?: string;
  bio?: string;
  interests?: string[];
  avatar?: string;
}

export interface TeacherFilterRequest {
  searchTerm?: string;
  skill?: string;
  minRating?: number;
  maxRating?: number;
  categoryId?: string;
}

export interface UserFilterRequest {
  searchTerm?: string;
  role?: UserRole;
}