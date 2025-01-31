export interface CreateReviewBody {
  sessionId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewBody {
  rating?: number;
  comment?: string;
}

export interface ReviewFilterRequest {
  teacherId?: string;
  learnerId?: string;
  minRating?: number;
  maxRating?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface TeacherReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  recentReviews: any[];
}
