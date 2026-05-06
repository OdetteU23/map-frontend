import { useState, useEffect, useRef } from 'react';
import { ImageUploading } from '../components/upload';
import useImageGallery from '../hooks/useImageGallery';
import { api } from '../helpers/data/fetchData';
import type { ListingImages } from 'map-hybrid-types-server';

interface ImageUploadPageProps {
  listingId?: number;
}

const ImageUploadPage: React.FC<ImageUploadPageProps> = ({ listingId }) => {
  const [images, setImages] = useState<ListingImages[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!listingId) return;
    let cancelled = false;
    api.upload.fetchImagesByListing(listingId)
      .then((data) => { if (!cancelled) setImages(data); })
      .catch((err) => console.error('Failed to load images:', err));
    return () => { cancelled = true; };
  }, [listingId, refreshKey]);

  const gallery = useImageGallery();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPreviewFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewFile) return;
    setIsSubmitting(true);
    try {
      await api.upload.uploadImage(previewFile, listingId);
      resetForm();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPreviewFile(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const canSubmit = previewFile && title.length > 3;

  return (
    <div className="upload-page">
      <h2 className="upload-page__heading">Upload</h2>

      <form className="form-section upload-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title..."
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="upload-form__textarea"
            name="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
          />
        </div>

        <div className="form-group">
          <label>File</label>
          <input
            type="file"
            name="file"
            accept="image/*, video/*"
            onChange={handleFileChange}
            ref={fileRef}
          />
        </div>

        <div className="upload-form__preview">
          <img
            src={
              previewFile
                ? URL.createObjectURL(previewFile)
                : 'https://placehold.co/320x240?text=Choose+image'
            }
            alt="preview"
          />
        </div>

        {!canSubmit && (title.length > 0 || previewFile) && (
          <p className="upload-form__hint">
            {!previewFile && title.length <= 3
              ? 'Please add a title (4+ chars) and select a file'
              : !previewFile
                ? 'Please select a file to upload'
                : 'Title must be more than 3 characters'}
          </p>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn--dark"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--light" onClick={resetForm}>
            Reset
          </button>
        </div>
      </form>

      {images.length > 0 && (
        <div className="upload-page__gallery">
          <ImageUploading
            images={images}
            selectedImage={gallery.selectedImage}
            onSelectImage={gallery.selectImage}
            onCloseModal={gallery.closeModal}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploadPage;
