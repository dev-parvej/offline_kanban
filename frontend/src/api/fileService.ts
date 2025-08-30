import { api } from "./axios";

export interface ImageUploadResponse {
  url: string;
  filename: string;
  message: string;
}

export interface ImageDeleteResponse {
  deleted_count: number;
  message: string;
  errors?: string[];
}

export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/files/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const validateImageFile = (file: File): string | null => {
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return 'File size must be less than 10MB';
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return 'Only JPG, PNG, GIF, and WebP images are allowed';
  }

  return null; // File is valid
};

export const deleteImages = async (urls: string[]): Promise<ImageDeleteResponse> => {
  const response = await api.delete('/files/delete/image', {
    data: { urls }
  });

  return response.data;
};

// Helper function to extract image URLs from HTML content
export const extractImageUrls = (htmlContent: string): string[] => {
  const imageUrls: string[] = [];
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    const src = match[1];
    // Only include our uploaded images (starting with /uploads/images/)
    if (src.startsWith('/uploads/images/')) {
      imageUrls.push(src);
    }
  }

  return imageUrls;
};

// Helper function to find images that were removed from content
export const findRemovedImages = (oldContent: string, newContent: string): string[] => {
  const oldImages = extractImageUrls(oldContent || '');
  const newImages = extractImageUrls(newContent || '');
  
  // Return images that exist in old but not in new content
  return oldImages.filter(img => !newImages.includes(img));
};