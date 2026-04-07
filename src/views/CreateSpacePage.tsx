import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import useCreateSpace from '../hooks/useCreateSpace';
import useImageUpload from '../hooks/useImageUpload';
import { ImageUploadingHandler } from '../components/upload';
import { api } from '../helpers/data/fetchData';

const CreateSpacePage: React.FC = () => {
  const navigate = useNavigate();
  const space = useCreateSpace();
  const [submitting, setSubmitting] = useState(false);

  const uploader = useImageUpload({
    maxFiles: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = await space.submitSpace();
      if (id && uploader.selectedFiles.length > 0) {
        // Upload images with the newly created space ID
        for (const file of uploader.selectedFiles) {
          await api.upload.uploadImage(file, id);
        }
      }
      if (id) {
        navigate('/provider');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-page__header">
        <button className="btn btn--light" onClick={() => navigate('/provider')}>
          <FiArrowLeft size={18} />
        </button>
        <h2 className="upload-page__title">Lisää uusi tila</h2>
      </div>

      <form className="form-section" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="cs-title">Otsikko *</label>
          <input
            id="cs-title"
            type="text"
            value={space.form.title}
            onChange={(e) => space.updateField('title', e.target.value)}
            placeholder="Esim. Moderni kokoustila"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cs-description">Kuvaus</label>
          <textarea
            className="upload-form__textarea"
            id="cs-description"
            value={space.form.description}
            onChange={(e) => space.updateField('description', e.target.value)}
            placeholder="Kerro tilasta tarkemmin..."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="cs-location">Sijainti *</label>
          <input
            id="cs-location"
            type="text"
            value={space.form.location}
            onChange={(e) => space.updateField('location', e.target.value)}
            placeholder="Esim. Helsinki, Kamppi"
            required
          />
        </div>

        <div className="upload-form__row">
          <div className="form-group">
            <label htmlFor="cs-capacity">Kapasiteetti</label>
            <input
              id="cs-capacity"
              type="number"
              min="1"
              value={space.form.capacity}
              onChange={(e) => space.updateField('capacity', e.target.value)}
              placeholder="Hlö määrä"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cs-price">Hinta / tunti (€) *</label>
            <input
              id="cs-price"
              type="number"
              min="0"
              step="0.5"
              value={space.form.price_per_hour}
              onChange={(e) => space.updateField('price_per_hour', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {space.categories.length > 0 && (
          <div className="form-group">
            <label htmlFor="cs-category">Kategoria</label>
            <select
              id="cs-category"
              value={space.form.category_id}
              onChange={(e) => space.updateField('category_id', e.target.value)}
            >
              <option value="">Valitse kategoria</option>
              {space.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Drag & drop multi-image picker */}
        <div className="form-group">
          <label>Kuvat</label>
          <ImageUploadingHandler
            previewUrls={uploader.previewUrls}
            selectedFiles={uploader.selectedFiles}
            isUploading={submitting}
            maxFiles={uploader.maxFiles}
            hideUploadButton
            onFileSelect={uploader.handleFileSelect}
            onDragOver={uploader.handleDragOver}
            onDrop={uploader.handleDrop}
            onRemoveFile={uploader.removeFile}
            onClearAll={uploader.clearAll}
            onUpload={() => {}}
          />
        </div>

        {space.error && (
          <p className="upload-form__hint" style={{ color: '#d88' }}>{space.error}</p>
        )}

        <div className="form-actions">
          <button className="btn btn--dark" type="submit" disabled={submitting || space.isSubmitting}>
            {submitting ? 'Luodaan...' : 'Luo tila'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSpacePage;
