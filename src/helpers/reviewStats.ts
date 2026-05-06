import type { Review } from 'map-hybrid-types-server';

const parseReviewRating = (rating: Review['rating']): number => {
  const numericRating = typeof rating === 'string' ? Number(rating) : rating;

  if (!Number.isFinite(numericRating)) {
    return 0;
  }

  return Math.min(5, Math.max(0, numericRating));
};

const calculateAverageReviewRating = (reviews: Review[]): number => {
  if (reviews.length === 0) {
    return 0;
  }

  const totalRating = reviews.reduce((sum, review) => sum + parseReviewRating(review.rating), 0);
  return totalRating / reviews.length;
};

const formatReviewSummary = (reviews: Review[]): string => {
  if (reviews.length === 0) {
    return 'Ei arvioita vielä';
  }

  const averageRating = calculateAverageReviewRating(reviews);
  return `Keskiarvioitus ${averageRating.toFixed(1)}/5 · ${reviews.length} arviota`;
};

export { calculateAverageReviewRating, formatReviewSummary, parseReviewRating };
