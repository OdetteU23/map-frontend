import { useState } from 'react';
import { api } from '../helpers/data/fetchData';
import type { UseImageUploadOptions } from '../helpers/types/localTypes';



const useImageUpload = ({ listingId, maxFiles = 5, onUploadComplete }: UseImageUploadOptions = {}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addFiles = (files: File[]) => {
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`);
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    addFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const upload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        await api.upload.uploadImage(file, listingId);
      }
      clearAll();
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFiles,
    previewUrls,
    isUploading,
    maxFiles,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    removeFile,
    clearAll,
    upload,
  };
};

export default useImageUpload;
