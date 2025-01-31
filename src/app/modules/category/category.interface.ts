export interface CreateCategoryBody {
  name: string;
  description?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  description?: string;
}

export type TCategoryFilterRequest = {
  searchTerm?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
};
