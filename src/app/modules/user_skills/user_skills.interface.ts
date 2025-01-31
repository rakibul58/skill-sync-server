import { JwtPayload } from "jsonwebtoken";

export interface UserSkillInput {
  skillId: string;
}

export interface BatchUserSkillOperations {
  user: JwtPayload;
  skills: UserSkillInput[];
}
