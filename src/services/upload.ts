import { config } from '@/config';
import { ApiResponse } from '@/types/api';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  type: string;
}

/**
 * Upload an image file to the server
 * @param file - File object to upload
 * @returns Promise with upload response containing file URL
 */
export async function uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
  const formData = new FormData();
  formData.append('image', file);

  const url = `${config.apiBaseUrl}/upload`;

  console.log('[Upload] Uploading file:', file.name);

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData, // Don't set Content-Type, browser will set it with boundary
  });

  console.log('[Upload] Response:', response.status, response.statusText);

  const data = await response.json();
  console.log('[Upload] Data:', data);

  return data;
}
