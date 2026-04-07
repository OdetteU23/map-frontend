import { useState } from 'react';
import type { ListingImages } from 'map-hybrid-types-server';

const useImageGallery = (onImageClick?: (imageId: number) => void) => {
  const [selectedImage, setSelectedImage] = useState<ListingImages | null>(null);

  const selectImage = (image: ListingImages) => {
    setSelectedImage(image);
    onImageClick?.(image.id);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    selectImage,
    closeModal,
  };
};

export default useImageGallery;
