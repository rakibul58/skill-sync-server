import { z } from "zod";

const createAdminValidationSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: "Password is required",
    }),
    admin: z.object({
      name: z.string({
        required_error: "Name is required",
      }),
      email: z.string({
        required_error: "Email is required!",
      }),
      avatar: z.string().optional(),
    }),
  }),
});

const updateAdminValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

const createTeacherValidationSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: "Password is required",
    }),
    teacher: z.object({
      name: z.string({
        required_error: "Name is required",
      }),
      email: z.string({
        required_error: "Email is required!",
      }),
      bio: z.string().optional(),
      expertise: z.string().optional(),
      yearsOfExperience: z.number().optional(),
      rating: z.number().optional().default(0),
      avatar: z.string().optional(),
      isVerified: z.boolean().optional().default(false),
    }),
  }),
});

const updateTeacherValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    bio: z.string().optional(),
    expertise: z.string().optional(),
    yearsOfExperience: z.number().optional(),
    avatar: z.string().optional(),
    isVerified: z.boolean().optional(),
  }),
});

const createLearnerValidationSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: "Password is required",
    }),
    customer: z.object({
      name: z.string({
        required_error: "Name is required!",
      }),
      email: z.string({
        required_error: "Email is required!",
      }),
      bio: z.string().optional(),
      interests: z.string().optional(),
      avatar: z.string().optional(),
    }),
  }),
});

const updateLearnerValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    bio: z.string().optional(),
    interests: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

export const UserValidations = {
  createAdminValidationSchema,
  updateAdminValidationSchema,
  createTeacherValidationSchema,
  updateTeacherValidationSchema,
  createLearnerValidationSchema,
  updateLearnerValidationSchema,
};
