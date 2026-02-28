export interface Comment {
  id: number;
  post_id: number;
  parent_id: number | null;
  author_name: string;
  author_email?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam' | 'rejected';
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  post_title?: string;
  post_slug?: string;
}

export interface CommentCreateInput {
  post_id: number;
  parent_id?: number;
  author_name: string;
  author_email: string;
  content: string;
  website?: string; // Honeypot field
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}
