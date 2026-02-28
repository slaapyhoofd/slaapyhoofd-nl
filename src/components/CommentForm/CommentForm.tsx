import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitComment } from '@/services/comments';
import {
  validateRequired,
  validateEmail,
  validateMaxLength,
  validateMinLength,
} from '@/utils/validation';
import './CommentForm.css';

interface CommentFormState {
  error?: string;
  success?: boolean;
}

interface PendingComment {
  tempId: number;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentFormProps {
  postId: number;
  onSubmitSuccess?: () => void;
  onOptimisticAdd?: (comment: PendingComment) => void;
}

// Separate component required by useFormStatus — must be a child of the <form>
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit Comment'}
    </button>
  );
}

async function submitCommentAction(
  postId: number,
  onSubmitSuccess: (() => void) | undefined,
  onOptimisticAdd: ((c: PendingComment) => void) | undefined,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  // Honeypot: silently succeed to avoid revealing detection to bots
  if (formData.get('website')) return { success: true };

  const name = (formData.get('author_name') as string) ?? '';
  const email = (formData.get('author_email') as string) ?? '';
  const content = (formData.get('content') as string) ?? '';

  // Client-side validation before hitting the network
  const checks = [
    validateRequired(name, 'Name'),
    validateMaxLength(name, 100, 'Name'),
    validateEmail(email),
    validateRequired(content, 'Comment'),
    validateMinLength(content, 10, 'Comment'),
    validateMaxLength(content, 1000, 'Comment'),
  ];
  for (const check of checks) {
    if (!check.valid) return { error: check.error };
  }

  // Optimistic update — show comment immediately while awaiting API
  onOptimisticAdd?.({
    tempId: Date.now(),
    author_name: name,
    content,
    created_at: new Date().toISOString(),
  });

  try {
    const response = await submitComment({
      post_id: postId,
      author_name: name,
      author_email: email,
      content,
      website: formData.get('website') as string,
    });

    if (response.success) {
      onSubmitSuccess?.();
      return { success: true };
    }
    return { error: response.message || 'Failed to submit comment' };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

function CommentForm({ postId, onSubmitSuccess, onOptimisticAdd }: CommentFormProps) {
  // Single state for the character counter (uncontrolled form otherwise)
  const [content, setContent] = useState('');

  const action = submitCommentAction.bind(null, postId, onSubmitSuccess, onOptimisticAdd);
  const [state, formAction] = useActionState(action, {});

  if (state.success) {
    return (
      <div className="comment-form-container">
        <div className="comment-success">
          Comment submitted successfully! It will appear after approval.
        </div>
      </div>
    );
  }

  return (
    <div className="comment-form-container">
      <h3>Leave a Comment</h3>

      {state.error && <div className="comment-error">{state.error}</div>}

      <form action={formAction} className="comment-form">
        <div className="form-group">
          <label htmlFor="author_name">Name *</label>
          <input
            type="text"
            id="author_name"
            name="author_name"
            required
            maxLength={100}
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="author_email">Email *</label>
          <input
            type="email"
            id="author_email"
            name="author_email"
            required
            maxLength={255}
            autoComplete="email"
          />
          <small>Your email will not be published</small>
        </div>

        {/* Honeypot — hidden from users, visible to bots */}
        <div className="form-group" style={{ display: 'none' }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="content">Comment *</label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={5}
            maxLength={1000}
          />
          <small>{content.length}/1000 characters</small>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}

export default CommentForm;
