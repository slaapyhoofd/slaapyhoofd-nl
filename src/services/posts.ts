import { fetchAPI } from './api';
import { Post, PostCreateInput, PostUpdateInput } from '@/types/post';
import { ApiResponse, Pagination } from '@/types/api';

// Public API - Get published posts (no auth required)
export async function getPublishedPosts(
  page = 1,
  perPage = 10,
): Promise<ApiResponse<{ posts: Post[]; pagination: Pagination }>> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  return fetchAPI(`/posts?${params}`);
}

// Public API - Get single post by slug (no auth required)
export async function getPostBySlug(slug: string): Promise<ApiResponse<Post>> {
  return fetchAPI<Post>(`/posts/${slug}`);
}

// Admin API - Get all posts with status filter
export async function getPosts(
  page = 1,
  perPage = 10,
  status?: string,
): Promise<ApiResponse<{ posts: Post[]; pagination: Pagination }>> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (status) params.append('status', status);

  return fetchAPI(`/admin/posts?${params}`);
}

export async function getPost(id: number): Promise<ApiResponse<Post>> {
  return fetchAPI<Post>(`/admin/posts/${id}`);
}

export async function createPost(data: PostCreateInput): Promise<ApiResponse<Post>> {
  return fetchAPI<Post>('/admin/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePost(
  id: number,
  data: Partial<PostUpdateInput>,
): Promise<ApiResponse<Post>> {
  return fetchAPI<Post>(`/admin/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePost(id: number): Promise<ApiResponse> {
  return fetchAPI(`/admin/posts/${id}`, {
    method: 'DELETE',
  });
}
