import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { api } from '../helpers/data/fetchData';

type SpaceDetailData = {
  title: string; location: string; price_per_hour: number;
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
  const { isLoggedIn } = useAuth();
  const [space, setSpace] = useState<SpaceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

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

        <p className="space-detail__price">{space.price_per_hour} € / tunti</p>

        <p className="space-detail__owner">Omistaja: {space.ownerName}</p>

        <p className="space-detail__desc">{space.description}</p>

        <div className="space-detail__actions">
          {isLoggedIn ? (
            <>
              <button className="btn btn--dark" onClick={() => {
                // Backend integration: call your booking API here
              }}>
                <FiCalendar size={16} /> Varaa tila
              </button>
              <button className="btn btn--light" onClick={() => navigate('/messages')}>
                <FiMessageSquare size={16} /> Lähetä viesti
              </button>
            </>
          ) : (
            <button className="btn btn--dark" onClick={() => navigate('/auth')}>
              Kirjaudu sisään varataksesi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpaceDetail;
