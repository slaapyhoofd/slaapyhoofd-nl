import { usePostEditor } from '@/contexts/PostEditorContext';
import ImageUploader from './ImageUploader';

function EditorSidebar() {
  const {
    status,
    category,
    tags,
    featuredImage,
    slug,
    setStatus,
    setCategory,
    setTags,
    setFeaturedImage,
    setSlug,
  } = usePostEditor();

  return (
    <div className="editor-sidebar">
      <div className="form-group">
        <label htmlFor="editor-status" className="form-label">
          Status
        </label>
        <select
          id="editor-status"
          className="form-input"
          value={status}
          onChange={e => setStatus(e.target.value as 'draft' | 'published')}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="editor-category" className="form-label">
          Category
        </label>
        <input
          id="editor-category"
          type="text"
          className="form-input"
          value={category}
          onChange={e => setCategory(e.target.value)}
          placeholder="e.g., Programming"
        />
      </div>

      <div className="form-group">
        <label htmlFor="editor-tags" className="form-label">
          Tags
        </label>
        <input
          id="editor-tags"
          type="text"
          className="form-input"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="comma, separated, tags"
        />
        <small>Separate tags with commas</small>
      </div>

      <div className="form-group">
        <label htmlFor="editor-featured-image" className="form-label">
          Featured Image
        </label>
        <ImageUploader onImageUploaded={setFeaturedImage} currentImage={featuredImage} />
        {featuredImage && !featuredImage.startsWith('/uploads/') && (
          <>
            <small style={{ display: 'block', marginTop: 'var(--spacing-sm)' }}>
              Or enter URL:
            </small>
            <input
              id="editor-featured-image"
              type="text"
              className="form-input"
              style={{ marginTop: 'var(--spacing-xs)' }}
              value={featuredImage}
              onChange={e => setFeaturedImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="editor-slug" className="form-label">
          Slug (optional)
        </label>
        <input
          id="editor-slug"
          type="text"
          className="form-input"
          value={slug}
          onChange={e => setSlug(e.target.value)}
          placeholder="auto-generated-from-title"
        />
        <small>Leave empty to auto-generate</small>
      </div>
    </div>
  );
}

export default EditorSidebar;
