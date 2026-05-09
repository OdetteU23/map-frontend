// Pure presentational components — all logic lives in hooks
import React from 'react';
import type { ListingImages } from 'map-hybrid-types-server';
import { FaCamera } from 'react-icons/fa';
import { api } from '../helpers/data/fetchData';

//  Image Gallery (viewer + modal) 

interface ImageGalleryProps {
  images: ListingImages[];
  selectedImage: ListingImages | null;
  columns?: number;
  onSelectImage: (image: ListingImages) => void;
  onCloseModal: () => void;
}

const ImageUploading: React.FC<ImageGalleryProps> = ({
  images,
  selectedImage,
  columns = 3,
  onSelectImage,
  onCloseModal,
}) => {
  return (
    <>
      <div
        className="gallery-grid"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {images.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--usx-text-secondary)' }}>
            No images to display
          </p>
        ) : (
          images.map((image) => (
            <div
              key={image.id}
              className={`gallery-grid__item ${selectedImage?.id === image.id ? 'gallery-grid__item--selected' : ''}`}
              onClick={() => onSelectImage(image)}
            >
              <img
                src={
                  typeof image.image_url === 'string' && image.image_url.startsWith('http')
                    ? image.image_url
                    : api.getUploadUrl(image.image_url)
                }
                alt={image.description || 'Image'}
                loading="lazy"
              />
            </div>
          ))
        )}
      </div>

      {selectedImage && (
        <div className="gallery-modal" onClick={onCloseModal}>
          <div className="gallery-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal__close" onClick={onCloseModal}>
              &times;
            </button>
            <img
              src={
                typeof selectedImage.image_url === 'string' && selectedImage.image_url.startsWith('http')
                  ? selectedImage.image_url
                  : api.getUploadUrl(selectedImage.image_url)
              }
              alt={selectedImage.description || 'Image'}
            />
            {selectedImage.description && (
              <p className="gallery-modal__caption">
                {selectedImage.description}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

//  Image Upload Handler (file picker + previews) 

interface ImageUploadHandlerProps {
  previewUrls: string[];
  selectedFiles: File[];
  isUploading: boolean;
  maxFiles: number;
  acceptedFormats?: string;
  hideUploadButton?: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
  onUpload: () => void;
}

const ImageUploadingHandler: React.FC<ImageUploadHandlerProps> = ({
  previewUrls,
  selectedFiles,
  isUploading,
  maxFiles,
  acceptedFormats = 'image/*',
  hideUploadButton,
  onFileSelect,
  onDragOver,
  onDrop,
  onRemoveFile,
  onClearAll,
  onUpload,
}) => {
  return (
    <div>
      <div className="upload-area" onDragOver={onDragOver} onDrop={onDrop}>
        <input
          type="file"
          id="file-input"
          multiple
          accept={acceptedFormats}
          onChange={onFileSelect}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
          <div className="upload-area__icon"><FaCamera /></div>
          <p className="upload-area__text">Drag & drop images here or click to select</p>
          <small className="upload-area__hint">Max {maxFiles} images</small>
        </label>
      </div>

      {previewUrls.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            Selected Images ({selectedFiles.length}/{maxFiles})
          </p>
          <div className="upload-previews">
            {previewUrls.map((url, index) => (
              <div key={index} className="upload-previews__item">
                <img src={url} alt={`Preview ${index + 1}`} />
                <button
                  className="upload-previews__remove"
                  onClick={() => onRemoveFile(index)}
                  disabled={isUploading}
                >
                  &times;
                </button>
                <p className="upload-previews__name">
                  {selectedFiles[index].name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="upload-actions">
          {!hideUploadButton && (
            <button
              className="btn btn--dark"
              onClick={onUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} image(s)`}
            </button>
          )}
          <button
            className="btn btn--light"
            onClick={onClearAll}
            disabled={isUploading}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export { ImageUploading, ImageUploadingHandler };
