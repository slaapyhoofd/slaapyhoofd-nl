import { Link } from 'react-router-dom';

interface PostsHeaderProps {
  title?: string;
}

function PostsHeader({ title = 'Manage Posts' }: PostsHeaderProps) {
  return (
    <header className="posts-header">
      <h1>{title}</h1>
      <Link to="/admin/posts/new" className="btn btn-primary">
        Create New Post
      </Link>
    </header>
  );
}

export default PostsHeader;
