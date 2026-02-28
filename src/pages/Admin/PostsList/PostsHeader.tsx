import { Link } from 'react-router-dom';

interface PostsHeaderProps {
  title?: string;
}

function PostsHeader({ title = 'Posts' }: PostsHeaderProps) {
  return (
    <div className="posts-page-header">
      <h1 className="posts-page-title">{title}</h1>
      <Link to="/admin/posts/new" className="btn btn-primary posts-new-btn">
        + New Post
      </Link>
    </div>
  );
}

export default PostsHeader;
