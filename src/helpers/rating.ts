const RATING_STORAGE_PREFIX = 'space-rating';

const getRatingKey = (spaceId: number): string => `${RATING_STORAGE_PREFIX}:${spaceId}`;

const normalizeRating = (rating: number): number => {
  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.min(5, Math.max(0, Math.round(rating)));
};

const getStoredRating = (spaceId: number): number => {
  if (typeof window === 'undefined') {
    return 0;
  }

  const storedValue = window.localStorage.getItem(getRatingKey(spaceId));
  if (storedValue === null) {
    return 0;
  }

  return normalizeRating(Number(storedValue));
};

const setStoredRating = (spaceId: number, rating: number): number => {
  const normalizedRating = normalizeRating(rating);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(getRatingKey(spaceId), String(normalizedRating));
  }

  return normalizedRating;
};

export { getStoredRating, normalizeRating, setStoredRating };
