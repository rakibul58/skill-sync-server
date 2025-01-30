interface CreateAdminBody {
  password: string;
  admin: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface UpdateAdminBody {
  name?: string;
  email?: string;
  avatar?: string;
}

interface CreateTeacherBody {
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

interface UpdateTeacherBody {
  name?: string;
  email?: string;
  bio?: string;
  expertise?: string;
  yearsOfExperience?: number;
  avatar?: string;
  isVerified?: boolean;
}

interface CreateLearnerBody {
  password: string;
  customer: {
    name: string;
    email: string;
    bio?: string;
    interests?: string;
    avatar?: string;
  };
}

interface UpdateLearnerBody {
  name?: string;
  email?: string;
  bio?: string;
  interests?: string;
  avatar?: string;
}