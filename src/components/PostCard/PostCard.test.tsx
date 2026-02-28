import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PostCard from './PostCard';
import { Post } from '@/types/post';

const mockPost: Post = {
  id: 1,
  slug: 'test-post',
  title: 'Test Post Title',
  excerpt: 'This is a test excerpt for the post.',
  content: '<p>Full content</p>',
  markdown_content: '# Full content',
  author: 'Test Author',
  category: 'Programming',
  tags: 'react,testing',
  featured_image: '/images/test.jpg',
  status: 'published',
  created_at: '2026-02-16T10:00:00Z',
  published_at: '2026-02-16T10:00:00Z',
  updated_at: '2026-02-16T10:00:00Z',
  views: 42,
};

describe('PostCard Component', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render post title', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('should render post excerpt', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText(/This is a test excerpt/)).toBeInTheDocument();
  });

  it('should render author name', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('should render category', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('Programming')).toBeInTheDocument();
  });

  it('should render view count', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('42 views')).toBeInTheDocument();
  });

  it('should render featured image when provided', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    const image = screen.getByAltText('Test Post Title');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/test.jpg');
  });

  it('should not render featured image section when not provided', () => {
    const postWithoutImage = { ...mockPost, featured_image: '' };
    renderWithRouter(<PostCard post={postWithoutImage} />);
    const image = screen.queryByAltText('Test Post Title');
    expect(image).not.toBeInTheDocument();
  });

  it('should render link to post detail page', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    const links = screen.getAllByRole('link');
    const titleLink = links.find(link => link.textContent === 'Test Post Title');
    expect(titleLink).toHaveAttribute('href', '/post/test-post');
  });

  it('should render "Read more" link', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('Read more →')).toBeInTheDocument();
  });

  it('should not render view count when zero', () => {
    const postWithoutViews = { ...mockPost, views: 0 };
    renderWithRouter(<PostCard post={postWithoutViews} />);
    expect(screen.queryByText(/views/)).not.toBeInTheDocument();
  });

  it('should not render category when not provided', () => {
    const postWithoutCategory = { ...mockPost, category: null };
    renderWithRouter(<PostCard post={postWithoutCategory} />);
    expect(screen.queryByText('Programming')).not.toBeInTheDocument();
  });
});
