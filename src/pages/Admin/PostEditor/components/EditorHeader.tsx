import { usePostEditor } from '@/contexts/PostEditorContext';

function EditorHeader() {
  const { isEditing, saving, handleCancel, handleSaveDraft, handlePublish } = usePostEditor();

  return (
    <header className="editor-header">
      <h1>{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
      <div className="editor-actions">
        <button onClick={handleCancel} className="btn btn-secondary" disabled={saving}>
          Cancel
        </button>
        <button onClick={handleSaveDraft} className="btn btn-secondary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button onClick={handlePublish} className="btn btn-primary" disabled={saving}>
          {saving ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </header>
  );
}

export default EditorHeader;
