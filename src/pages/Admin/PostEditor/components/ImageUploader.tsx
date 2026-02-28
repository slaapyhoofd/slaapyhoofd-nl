import { useState, useRef } from 'react';
import { uploadImage } from '@/services/upload';
import './ImageUploader.css';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

function ImageUploader({ onImageUploaded, currentImage }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const response = await uploadImage(file);
      
      if (response.success && response.data) {
        onImageUploaded(response.data.url);
      } else {
        setError(response.error || 'Upload failed');
        setPreview('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader">
      {preview ? (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button
            type="button"
            onClick={handleRemove}
            className="btn btn-secondary btn-sm remove-btn"
            disabled={uploading}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="file-input"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="upload-label">
            {uploading ? (
              <>
                <div className="loading-spinner"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg aria-hidden="true" focusable="false" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Click to upload image</span>
                <small>JPG, PNG, GIF, WebP (max 5MB)</small>
              </>
            )}
          </label>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default ImageUploader;
