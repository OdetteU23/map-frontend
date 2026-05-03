/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { isUser, getUserDisplayName } from '../helpers/types/localTypes';
import { api } from '../helpers/data/fetchData';
import type { Bookings, Review } from 'map-hybrid-types-server';
import StarRating from '../components/StarRating';
import { calculateAverageReviewRating, formatReviewSummary } from '../helpers/reviewStats';

type SpaceDetailData = {
  id: number;
  title: string;
  location: string;
  price_per_hour: number;
  price_per_day?: number;
  ownerName: string;
  ownerEmail?: string;
  ownerId?: number;
  description: string;
  images: string[];
};

const SpaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [space, setSpace] = useState<SpaceDetailData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Bookings | null>(null);
  const [bookingMode, setBookingMode] = useState<'hours' | 'days'>('hours');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingHours, setBookingHours] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  const averageReviewRating = calculateAverageReviewRating(reviews);
  const reviewSummary = formatReviewSummary(reviews);
  const pricePerDay = space?.price_per_day || (space ? space.price_per_hour * 24 : 0);

  const dayCount = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const hourlyTotalPrice = space ? space.price_per_hour * bookingHours : 0;
  const dailyTotalPrice = space ? pricePerDay * dayCount : 0;
  const totalPrice = bookingMode === 'hours' ? hourlyTotalPrice : dailyTotalPrice;

  useEffect(() => {
    if (!id) return;

    const loadSpace = async () => {
      try {
        const data = await api.media.fetchSpaceById(Number(id));

        let images: string[] = [];
        try {
          const imgs = await api.upload.fetchImagesByListing(Number(id));
          images = imgs.map((img) => api.getUploadUrl(img.image_url));
        } catch {
          // no images yet
        }

        let ownerName = '';
        let ownerEmail = '';
        const ownerId = (data as any).owner_id ?? (data as any).ownerId;
        if ((data as any).owner) {
          const o = (data as any).owner;
          ownerName = o.username || o.Firstname || o.business_name || ownerName;
          ownerEmail = o.email || ownerEmail;
        }
        ownerName = ownerName || (data as any).owner_name || (data as any).owner_username || '';
        ownerEmail = ownerEmail || (data as any).owner_email || (data as any).ownerEmail || '';

        const possibleUsername = (data as any).owner_username || (data as any).owner_name || (data as any).owner?.username;
        if (!ownerEmail && possibleUsername) {
          try {
            const ownerProfile = await api.user.fetchUserProfile(possibleUsername);
            ownerEmail = ownerProfile.email || ownerEmail;
            ownerName = ownerName || ownerProfile.username || ownerProfile.Firstname || '';
          } catch {
            // ignore profile fetch failures
          }
        }

        setSpace({
          id: Number(id),
          title: data.title,
          location: data.location,
          price_per_hour: data.price_per_hour,
          price_per_day: 'price_per_day' in data ? (data as Record<string, unknown>).price_per_day as number : undefined,
          ownerName,
          ownerEmail,
          ownerId,
          description: data.description || '',
          images,
        });
      } catch (err) {
        console.error('Failed to fetch space:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSpace();
  }, [id]);

  useEffect(() => {
    setSelectedRating(0);
    setReviewError(null);
    setReviewSuccess(null);
  }, [id]);

  useEffect(() => {
    if (!space?.title) {
      setReviews([]);
      return;
    }

    const loadReviews = async () => {
      try {
        const fetchedReviews = await api.media.fetchReviews(space.id);
        setReviews(fetchedReviews);
      } catch (err) {
        console.error('Failed to load reviews:', err);
        setReviews([]);
      }
    };

    loadReviews();
  }, [space?.title]);

  const handleReviewRatingChange = (nextRating: number) => {
    setSelectedRating(nextRating);
    setReviewError(null);
    setReviewSuccess(null);
  };

  const handleReviewSubmit = async () => {
    if (!space) {
      return;
    }

    if (!user || !isUser(user)) {
      setReviewError('Kirjaudu sisään jättääksesi arvion.');
      return;
    }

    if (selectedRating < 1) {
      setReviewError('Valitse vähintään yksi tähti.');
      return;
    }

    setIsReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      await api.media.addReview({
        user_id: user.id,
        space_id: space.id,
        rating: selectedRating,
        comment: '',
      });

      const updatedReviews = await api.media.fetchReviews(space.id);
      setReviews(updatedReviews);
      setSelectedRating(0);
      setReviewSuccess('Arvio lähetetty onnistuneesti.');
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewError(err instanceof Error ? err.message : 'Arvion lähettäminen epäonnistui.');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleReviewSignIn = () => {
    navigate('/auth');
  };

  if (loading) {
    return <div className="space-detail"><p>Ladataan...</p></div>;
  }

  if (!space) {
    return (
      <div className="space-detail">
        <button className="space-detail__back" onClick={() => navigate(-1)}>
          <FiArrowLeft size={20} /> Takaisin
        </button>
        <p className="space-detail__not-found">Tilaa ei löytynyt.</p>
      </div>
    );
  }

  return (
    <div className="space-detail">
      <button className="space-detail__back" onClick={() => navigate(-1)}>
        <FiArrowLeft size={20} /> Takaisin
      </button>

      {space.images.length > 0 ? (
        <div className="space-detail__gallery">
          <img
            className="space-detail__image"
            src={space.images[activeImg]}
            alt={space.title}
          />
          {space.images.length > 1 && (
            <div className="space-detail__thumbs">
              {space.images.map((url, i) => (
                <img
                  key={i}
                  className={`space-detail__thumb ${i === activeImg ? 'space-detail__thumb--active' : ''}`}
                  src={url}
                  alt={`${space.title} ${i + 1}`}
                  onClick={() => setActiveImg(i)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-detail__no-image">Ei kuvia</div>
      )}

      <div className="space-detail__body">
        <h2 className="space-detail__title">{space.title}</h2>
        <p className="space-detail__location">{space.location}</p>

        <div className="space-detail__rating-overview">
          <StarRating
            value={averageReviewRating}
            size={20}
            className="space-detail__stars-rating"
          />
          <p className="space-detail__rating-summary">{reviewSummary}</p>
        </div>

        <div className="space-detail__pricing">
          <p className="space-detail__price">{space.price_per_hour} € / tunti</p>
          <p className="space-detail__price space-detail__price--daily">{(space.price_per_day || space.price_per_hour * 24).toFixed(0)} € / päivä</p>
        </div>

        <p className="space-detail__owner">Omistaja: {space.ownerName}
          {space.ownerEmail && (
            <>
              {' '}- <button
                className="space-detail__owner-email"
                onClick={() => navigate('/messages', { state: { recipientId: space.ownerId } })}
                style={{ background: 'transparent', border: 'none', color: '#2b9fd6', cursor: 'pointer', padding: 0 }}
              >{space.ownerEmail}</button>
            </>
          )}
        </p>

        <p className="space-detail__desc">{space.description}</p>

        <section className="form-section space-detail__review-form">
          <h3 className="form-section__title">Arvioi tila</h3>
          <p className="space-detail__review-note">
            {isLoggedIn && isUser(user)
              ? 'Valitse tähtiarvosana ja lähetä se kaikkien nähtäväksi.'
              : 'Kirjaudu sisään jättääksesi oman arvion tästä tilasta.'}
          </p>

          {isLoggedIn && isUser(user) ? (
            <>
              <StarRating
                value={selectedRating}
                interactive
                size={20}
                className="space-detail__review-stars"
                onChange={handleReviewRatingChange}
              />

              {reviewError && <p className="account-info__message account-info__message--error">{reviewError}</p>}
              {reviewSuccess && <p className="account-info__message account-info__message--success">{reviewSuccess}</p>}

              <button
                type="button"
                className="btn btn--dark"
                onClick={handleReviewSubmit}
                disabled={isReviewSubmitting || selectedRating === 0}
              >
                {isReviewSubmitting ? 'Lähetetään...' : 'Lähetä arvio'}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn--dark"
              onClick={handleReviewSignIn}
            >
              Kirjaudu sisään arvioidaksesi
            </button>
          )}
        </section>

        <div className="booking-card">
          {isLoggedIn ? (
            <>
              <div className="booking-card__header">
                <span className="booking-card__total-label">Yhteensä</span>
                <span className="booking-card__total-price">
                  {totalPrice.toFixed(0)} €
                </span>
              </div>

              <div className="booking-card__mode-toggle">
                <button
                  className={`booking-card__mode-btn ${bookingMode === 'hours' ? 'booking-card__mode-btn--active' : ''}`}
                  onClick={() => setBookingMode('hours')}
                >
                  Tunneittain
                </button>
                <button
                  className={`booking-card__mode-btn ${bookingMode === 'days' ? 'booking-card__mode-btn--active' : ''}`}
                  onClick={() => setBookingMode('days')}
                >
                  Päivittäin
                </button>
              </div>

              {bookingMode === 'hours' ? (
                <>
                  <div className="booking-card__fields">
                    <div className="booking-card__field booking-card__field--left">
                      <span className="booking-card__field-label">ALOITUSAIKA</span>
                      <input
                        type="datetime-local"
                        className="booking-card__input"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                      />
                    </div>
                    <div className="booking-card__field booking-card__field--right">
                      <span className="booking-card__field-label">KESTO (TUNTIA)</span>
                      <input
                        type="number"
                        className="booking-card__input"
                        min={1}
                        max={24}
                        value={bookingHours}
                        onChange={(e) => setBookingHours(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="booking-card__price-row">
                    <span>{space.price_per_hour} € × {bookingHours} tunti{bookingHours > 1 ? 'a' : ''}</span>
                    <span>{hourlyTotalPrice.toFixed(0)} €</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="booking-card__fields">
                    <div className="booking-card__field booking-card__field--left">
                      <span className="booking-card__field-label">SISÄÄNKIRJAUTUMINEN</span>
                      <input
                        type="date"
                        className="booking-card__input"
                        value={checkIn}
                        onChange={(e) => {
                          setCheckIn(e.target.value);
                          if (checkOut && e.target.value >= checkOut) setCheckOut('');
                        }}
                      />
                    </div>
                    <div className="booking-card__field booking-card__field--right">
                      <span className="booking-card__field-label">ULOSKIRJAUTUMINEN</span>
                      <input
                        type="date"
                        className="booking-card__input"
                        value={checkOut}
                        min={checkIn || undefined}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                  </div>

                  {dayCount > 0 && (
                    <div className="booking-card__price-row">
                      <span>{pricePerDay.toFixed(0)} € × {dayCount} päivä{dayCount > 1 ? 'ä' : ''}</span>
                      <span>{dailyTotalPrice.toFixed(0)} €</span>
                    </div>
                  )}
                </>
              )}

              <button
                className="booking-card__submit"
                disabled={
                  bookingStatus === 'loading' ||
                  (bookingMode === 'hours' && !bookingDate) ||
                  (bookingMode === 'days' && (!checkIn || !checkOut))
                }
                onClick={async () => {
                  if (!user || !id) return;
                  setBookingStatus('loading');
                  try {
                    let startTime: Date;
                    let endTime: Date;
                    if (bookingMode === 'hours') {
                      if (!bookingDate) return;
                      startTime = new Date(bookingDate);
                      endTime = new Date(startTime.getTime() + bookingHours * 60 * 60 * 1000);
                    } else {
                      if (!checkIn || !checkOut) return;
                      startTime = new Date(checkIn);
                      endTime = new Date(checkOut);
                    }
                    const result = await api.media.createBooking({
                      space_id: Number(id),
                      user_id: user.id as Bookings['user_id'],
                      start_time: startTime,
                      end_time: endTime,
                      status: 'pending',
                    });
                    setConfirmedBooking(result);
                    setBookingStatus('success');
                    setShowSuccessPopup(true);

                    try {
                      const ownerId = space?.ownerId;
                      if (ownerId && user) {
                        const senderId = (user as any).id;
                        const senderName = isUser(user) ? getUserDisplayName(user) : ((user as any).username || `User ${senderId}`);
                        const content = `Uusi varauspyyntö (#${result.id}) käyttäjältä ${senderName} tilaan "${space.title}" alkaen ${new Date(result.start_time).toLocaleString('fi-FI')} - ${new Date(result.end_time).toLocaleString('fi-FI')}`;
                        api.media.sendMessage({ sender_id: senderId, receiver_id: ownerId, content }).catch((e) => console.error('Failed to send owner message', e));
                        try {
                          api.media.createNotification({
                            user_id: ownerId,
                            type: 'booking',
                            content,
                          }).catch((e) =>
                            console.error('Failed to create owner notification', e)
                          );
                        } catch (e) {
                          console.error('Notification creation call failed:', e);
                        }

                        try {
                          window.dispatchEvent(new CustomEvent('booking:created', { detail: result }));
                        } catch {
                          try {
                            const ev = document.createEvent('CustomEvent');
                            ev.initCustomEvent('booking:created', true, true, result as any);
                            window.dispatchEvent(ev);
                          } catch (inner) {
                            console.error('Failed to dispatch booking event', inner);
                          }
                        }
                      }
                    } catch (notifyErr) {
                      console.error('Owner notification failed:', notifyErr);
                    }
                  } catch (err) {
                    console.error('Booking failed:', err);
                    setBookingStatus('error');
                  }
                }}
              >
                {bookingStatus === 'loading' ? 'Varataan...' :
                 bookingStatus === 'success' ? 'Varattu!' :
                 bookingStatus === 'error' ? 'Varaus epäonnistui' : 'Varaa'}
              </button>

              <p className="booking-card__note">Sinua veloitetaan varauksen vahvistamisen jälkeen</p>

              <button className="booking-card__message" onClick={() => navigate('/messages', { state: { recipientId: space.ownerId } })}>
                <FiMessageSquare size={16} /> Lähetä viesti
              </button>
            </>
          ) : (
            <button className="booking-card__submit" onClick={() => navigate('/auth')}>
              Kirjaudu sisään varataksesi
            </button>
          )}
        </div>
      </div>

      {showSuccessPopup && confirmedBooking && (
        <div className="booking-popup-overlay" onClick={() => setShowSuccessPopup(false)}>
          <div className="booking-popup" onClick={(e) => e.stopPropagation()}>
            <button className="booking-popup__close" onClick={() => setShowSuccessPopup(false)}>×</button>
            <div className="booking-popup__icon">✓</div>
            <h3 className="booking-popup__title">Varauspyyntö lähetetty onnistuneesti!</h3>
            <div className="booking-popup__details">
              <p><strong>Tila:</strong> {space.title}</p>
              <p><strong>Alkaa:</strong> {new Date(confirmedBooking.start_time).toLocaleString('fi-FI')}</p>
              <p><strong>Päättyy:</strong> {new Date(confirmedBooking.end_time).toLocaleString('fi-FI')}</p>
              <p><strong>Yhteensä:</strong> {totalPrice.toFixed(0)} €</p>
              <p><strong>Tila:</strong> Odottaa hyväksyntää</p>
            </div>
            <button className="booking-popup__btn" onClick={() => navigate('/bookings')}>Näytä varaukset</button>
            <button className="booking-popup__btn" onClick={() => navigate('/payment', { state: { bookingId: confirmedBooking.id, amount: totalPrice } })}>Maksa nyt</button>
            <button className="booking-popup__btn booking-popup__btn--secondary" onClick={() => setShowSuccessPopup(false)}>Sulje</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceDetail;
