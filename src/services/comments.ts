import { fetchAPI } from './api';
import { ApiResponse, Pagination } from '@/types/api';
import { Comment, CommentCreateInput as CommentSubmission, CommentWithReplies } from '@/types/comment';

export type { Comment, CommentSubmission };

/**
 * Get approved comments for a post (returns nested tree)
 */
export async function getComments(postId: number): Promise<ApiResponse<CommentWithReplies[]>> {
  return fetchAPI(`/comments?post_id=${postId}`);
}

/**
 * Submit a new comment
 */
export async function submitComment(comment: CommentSubmission): Promise<ApiResponse<{ id: number; status: string; message: string }>> {
  return fetchAPI('/comments', {
    method: 'POST',
    body: JSON.stringify(comment),
  });
}

/**
 * Get all comments (admin only)
 */
export async function getAllComments(page = 1, perPage = 20, status?: string): Promise<ApiResponse<{ comments: Comment[]; pagination: Pagination }>> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (status) params.append('status', status);
  
  return fetchAPI(`/admin/comments?${params}`);
}

/**
 * Update comment status (admin only)
 */
export async function updateCommentStatus(id: number, status: string): Promise<ApiResponse<{ message: string }>> {
  return fetchAPI(`/admin/comments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/**
 * Delete comment (admin only)
 */
export async function deleteComment(id: number): Promise<ApiResponse<{ message: string }>> {
  return fetchAPI(`/admin/comments/${id}`, {
    method: 'DELETE',
  });
}
