interface CreateSkillBody {
  name: string;
  description?: string;
  categoryId: string;
}

interface UpdateSkillBody {
  name?: string;
  description?: string;
  categoryId?: string;
}

interface SkillFilterRequest {
  searchTerm?: string;
  categoryId?: string;
  name?: string;
}
