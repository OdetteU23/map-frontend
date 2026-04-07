import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { api } from '../helpers/data/fetchData';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';
import type { Category } from 'map-hybrid-types-server';

type SpaceFormData = {
  title: string;
  description: string;
  location: string;
  capacity: string;
  price_per_hour: string;
  category_id: string;
};

const EditSpacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<SpaceFormData>({
    title: '',
    description: '',
    location: '',
    capacity: '',
    price_per_hour: '',
    category_id: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.media.fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    const loadSpace = async () => {
      try {
        const space = await api.media.fetchSpaceById(Number(id));
        // Ownership check on the frontend
        if (user && isUser(user) && user.role !== 'admin' && space.owner_id !== user.id) {
          setError('Sinulla ei ole oikeutta muokata tätä tilaa.');
          return;
        }
        setForm({
          title: space.title || '',
          description: space.description || '',
          location: space.location || '',
          capacity: String(space.capacity || ''),
          price_per_hour: String(space.price_per_hour || ''),
          category_id: space.category_id ? String(space.category_id) : '',
        });
      } catch (err) {
        setError('Tilan tietojen lataaminen epäonnistui.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSpace();
  }, [id, user]);

  const updateField = (field: keyof SpaceFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!form.title.trim() || !form.location.trim() || !form.price_per_hour) {
      setError('Täytä kaikki pakolliset kentät (otsikko, sijainti, hinta)');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.upload.updateSpace(Number(id), {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        capacity: Number(form.capacity) || 1,
        price_per_hour: Number(form.price_per_hour),
        category_id: form.category_id ? Number(form.category_id) : undefined,
      });
      navigate('/provider');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tilan päivittäminen epäonnistui.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="upload-page"><p>Ladataan...</p></div>;
  }

  return (
    <div className="upload-page">
      <div className="upload-page__header">
        <button className="btn btn--light" onClick={() => navigate('/provider')}>
          <FiArrowLeft size={18} />
        </button>
        <h2 className="upload-page__title">Muokkaa tilaa</h2>
      </div>

      <form className="form-section" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="es-title">Otsikko *</label>
          <input
            id="es-title"
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Esim. Moderni kokoustila"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="es-description">Kuvaus</label>
          <textarea
            className="upload-form__textarea"
            id="es-description"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Kerro tilasta tarkemmin..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="es-location">Sijainti *</label>
          <input
            id="es-location"
            type="text"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="Esim. Helsinki, Kamppi"
            required
          />
        </div>

        <div className="upload-form__row">
          <div className="form-group">
            <label htmlFor="es-capacity">Kapasiteetti</label>
            <input
              id="es-capacity"
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) => updateField('capacity', e.target.value)}
              placeholder="Hlö määrä"
            />
          </div>

          <div className="form-group">
            <label htmlFor="es-price">Hinta / tunti (€) *</label>
            <input
              id="es-price"
              type="number"
              min="0"
              step="0.5"
              value={form.price_per_hour}
              onChange={(e) => updateField('price_per_hour', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="form-group">
            <label htmlFor="es-category">Kategoria</label>
            <select
              id="es-category"
              value={form.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}
            >
              <option value="">Valitse kategoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="upload-form__hint" style={{ color: '#d88' }}>{error}</p>
        )}

        <div className="form-actions">
          <button className="btn btn--dark" type="submit" disabled={submitting}>
            {submitting ? 'Tallennetaan...' : 'Tallenna muutokset'}
          </button>
          <button className="btn btn--light" type="button" onClick={() => navigate('/provider')}>
            Peruuta
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSpacePage;
