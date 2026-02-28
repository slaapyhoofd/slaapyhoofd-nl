import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommentForm from './CommentForm';

describe('CommentForm Component', () => {
  it('should render form title', () => {
    render(<CommentForm postId={1} />);
    expect(screen.getByText('Leave a Comment')).toBeInTheDocument();
  });

  it('should render name input field', () => {
    render(<CommentForm postId={1} />);
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
  });

  it('should render email input field', () => {
    render(<CommentForm postId={1} />);
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });

  it('should render comment textarea', () => {
    render(<CommentForm postId={1} />);
    expect(screen.getByLabelText(/Comment/)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<CommentForm postId={1} />);
    expect(screen.getByRole('button', { name: /Submit Comment/ })).toBeInTheDocument();
  });

  it('should show email privacy notice', () => {
    render(<CommentForm postId={1} />);
    expect(screen.getByText(/Your email will not be published/)).toBeInTheDocument();
  });

  it('should show character counter for comment field', () => {
    render(<CommentForm postId={1} />);
    expect(screen.getByText(/0\/1000 characters/)).toBeInTheDocument();
  });

  it('should have required attribute on name field', () => {
    render(<CommentForm postId={1} />);
    const nameInput = screen.getByLabelText(/Name/) as HTMLInputElement;
    expect(nameInput.required).toBe(true);
  });

  it('should have required attribute on email field', () => {
    render(<CommentForm postId={1} />);
    const emailInput = screen.getByLabelText(/Email/) as HTMLInputElement;
    expect(emailInput.required).toBe(true);
  });

  it('should have required attribute on content field', () => {
    render(<CommentForm postId={1} />);
    const contentTextarea = screen.getByLabelText(/Comment/) as HTMLTextAreaElement;
    expect(contentTextarea.required).toBe(true);
  });

  it('should have maxLength attribute on name field', () => {
    render(<CommentForm postId={1} />);
    const nameInput = screen.getByLabelText(/Name/) as HTMLInputElement;
    expect(nameInput.maxLength).toBe(100);
  });

  it('should have maxLength attribute on email field', () => {
    render(<CommentForm postId={1} />);
    const emailInput = screen.getByLabelText(/Email/) as HTMLInputElement;
    expect(emailInput.maxLength).toBe(255);
  });

  it('should have maxLength attribute on content field', () => {
    render(<CommentForm postId={1} />);
    const contentTextarea = screen.getByLabelText(/Comment/) as HTMLTextAreaElement;
    expect(contentTextarea.maxLength).toBe(1000);
  });

  it('should have honeypot field hidden from view', () => {
    render(<CommentForm postId={1} />);
    const honeypotField = screen.getByLabelText(/Website/);
    const honeypotContainer = honeypotField.closest('.form-group') as HTMLElement;
    expect(honeypotContainer).toHaveStyle({ display: 'none' });
  });

  it('should have aria-hidden on honeypot field', () => {
    render(<CommentForm postId={1} />);
    const honeypotField = screen.getByLabelText(/Website/);
    const honeypotContainer = honeypotField.closest('.form-group') as HTMLElement;
    expect(honeypotContainer).toHaveAttribute('aria-hidden', 'true');
  });
});
