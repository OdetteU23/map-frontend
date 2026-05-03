import { useState, type FC } from 'react';
import { FiStar } from 'react-icons/fi';

type StarRatingProps = {
  value: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  className?: string;
  onChange?: (value: number) => void;
};

const FILLED_COLOR = '#f5c542';
const EMPTY_COLOR = '#000000';

const StarRating: FC<StarRatingProps> = ({
  value,
  max = 5,
  size = 16,
  interactive = false,
  className,
  onChange,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  const handleSelect = (nextValue: number) => {
    if (!interactive) {
      return;
    }

    onChange?.(nextValue);
  };

  const rootClassName = ['star-rating', interactive ? 'star-rating--interactive' : 'star-rating--static', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayValue;

        if (!interactive) {
          return (
            <span key={starValue} className="star-rating__icon" aria-hidden="true">
              <FiStar
                size={size}
                fill={isFilled ? FILLED_COLOR : 'none'}
                stroke={isFilled ? FILLED_COLOR : EMPTY_COLOR}
              />
            </span>
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            className="star-rating__button"
            aria-label={`Rate ${starValue} out of ${max}`}
            aria-pressed={starValue <= value}
            onClick={(event) => {
              event.stopPropagation();
              handleSelect(starValue);
            }}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(null)}
            onFocus={() => setHoverValue(starValue)}
            onBlur={() => setHoverValue(null)}
          >
            <FiStar
              size={size}
              fill={isFilled ? FILLED_COLOR : 'none'}
              stroke={isFilled ? FILLED_COLOR : EMPTY_COLOR}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
