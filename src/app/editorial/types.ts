export interface ReviewerSuggestion {
  user_id: number;
  username: string;
  similarity_score: number;
  match_percentage: number;
}

export interface ReviewerRecommendationResponse {
  article_id: number;
  article_title: string;
  community_id: number;
  article_status: string;
  suggestions: ReviewerSuggestion[];
}
