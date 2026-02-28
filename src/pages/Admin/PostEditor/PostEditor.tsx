import { PostEditorProvider, usePostEditor } from '@/contexts/PostEditorContext';
import { useMarkdown } from '@/hooks/useMarkdown';
import EditorHeader from './components/EditorHeader';
import EditorSidebar from './components/EditorSidebar';
import EditorContent from './components/EditorContent';
import './PostEditor.css';

function PostEditorInner() {
  const { loading, error, showPreview, markdownContent } = usePostEditor();
  const { html: previewHtml } = useMarkdown(markdownContent);

  const renderMarkdownPreview = () => ({ __html: previewHtml });

  if (loading) {
    return (
      <div className="container">
        <div role="status" className="loading-container">
          <div className="loading" aria-hidden="true"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="post-editor">
        <EditorHeader />

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div className="editor-container">
          <EditorSidebar />
          <EditorContent 
            showPreview={showPreview}
            renderMarkdownPreview={renderMarkdownPreview}
          />
        </div>
      </div>
    </div>
  );
}

function PostEditor() {
  return (
    <PostEditorProvider>
      <PostEditorInner />
    </PostEditorProvider>
  );
}

export default PostEditor;
