import { usePostEditor } from '@/contexts/PostEditorContext';

interface EditorContentProps {
  showPreview: boolean;
  renderMarkdownPreview: () => { __html: string };
}

function EditorContent({ showPreview, renderMarkdownPreview }: EditorContentProps) {
  const {
    title,
    excerpt,
    markdownContent,
    setTitle,
    setExcerpt,
    setMarkdownContent,
    setShowPreview,
  } = usePostEditor();

  return (
    <div className="editor-main">
      <div className="form-group">
        <label htmlFor="editor-title" className="form-label">Title *</label>
        <input
          id="editor-title"
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="editor-excerpt" className="form-label">Excerpt</label>
        <textarea
          id="editor-excerpt"
          className="form-textarea"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Brief summary..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <div className="editor-toolbar">
          <label htmlFor="editor-content" className="form-label">Content (Markdown) *</label>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            aria-pressed={showPreview}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>

        {!showPreview ? (
          <textarea
            id="editor-content"
            className="form-textarea editor-content"
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            placeholder="Write your post in Markdown..."
            required
          />
        ) : (
          <div 
            className="markdown-preview"
            dangerouslySetInnerHTML={renderMarkdownPreview()}
          />
        )}
      </div>
    </div>
  );
}

export default EditorContent;
