export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  markdown_content: string;
  author: string;
  category: string | null;
  tags: string | null;
  featured_image: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at: string | null;
  views: number;
}

export interface PostCreateInput {
  title: string;
  slug?: string;
  excerpt?: string;
  markdown_content: string;
  category?: string;
  tags?: string;
  featured_image?: string;
  status?: 'draft' | 'published';
}

export interface PostUpdateInput extends Partial<PostCreateInput> {
  id: number;
}
