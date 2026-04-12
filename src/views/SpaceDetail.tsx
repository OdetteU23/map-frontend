import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { api } from '../helpers/data/fetchData';
import type { Bookings } from 'map-hybrid-types-server';

type SpaceDetailData = {
  title: string; location: string; price_per_hour: number; price_per_day?: number;
  ownerName: string; rating: number; description: string; images: string[];
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="space-detail__stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar key={i} size={20} fill={i <= count ? '#000' : 'none'} stroke="#000" />
      ))}
    </div>
  );
}

const SpaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [space, setSpace] = useState<SpaceDetailData | null>(null);
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

  const pricePerDay = space?.price_per_day || (space ? space.price_per_hour * 24 : 0);

  const dayCount = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const totalPrice = space
    ? bookingMode === 'hours'
      ? space.price_per_hour * bookingHours
      : pricePerDay * dayCount
    : 0;

  useEffect(() => {
    if (!id) return;
    const loadSpace = async () => {
      try {
        const data = await api.media.fetchSpaceById(Number(id));

        // Fetch all images for this space
        let images: string[] = [];
        try {
          const imgs = await api.upload.fetchImagesByListing(Number(id));
          images = imgs.map((img) => api.getUploadUrl(img.image_url));
        } catch { /* no images */ }

        setSpace({
          title: data.title,
          location: data.location,
          price_per_hour: data.price_per_hour,
          price_per_day: 'price_per_day' in data ? (data as Record<string, unknown>).price_per_day as number : undefined,
          ownerName: '',
          rating: 0,
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
        <StarRating count={space.rating} />

        <div className="space-detail__pricing">
          <p className="space-detail__price">{space.price_per_hour} € / tunti</p>
          <p className="space-detail__price space-detail__price--daily">{(space.price_per_day || space.price_per_hour * 24).toFixed(0)} € / päivä</p>
        </div>

        <p className="space-detail__owner">Omistaja: {space.ownerName}</p>

        <p className="space-detail__desc">{space.description}</p>

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
                    <span>{(space.price_per_hour * bookingHours).toFixed(0)} €</span>
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
                      <span>{(pricePerDay * dayCount).toFixed(0)} €</span>
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

              <button className="booking-card__message" onClick={() => navigate('/messages')}>
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
            <button className="booking-popup__btn booking-popup__btn--secondary" onClick={() => setShowSuccessPopup(false)}>Sulje</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceDetail;
