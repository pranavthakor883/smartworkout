import { useParams, Link } from "react-router-dom";

const posts = [
  {
    id: 1,
    title: "How AI is Revolutionizing Personal Fitness",
    category: "AI & Fitness",
    content: "Full content of AI & Fitness blog..."
  },
  {
    id: 2,
    title: "The Science Behind Adaptive Training Programs",
    category: "Training Science",
    content: "Full content of training science blog..."
  },
  {
    id: 3,
    title: "Nutrition Meets Machine Learning",
    category: "Nutrition",
    content: "Full content of nutrition blog..."
  },
  {
    id: 4,
    title: "From Beginner to Advanced: AI-Guided Progression",
    category: "Success Stories",
    content: "Full content of nutrition blog..."
  },
  {
    id: 5,
    title: "Recovery Optimization with Data Analytics",
    category: "Recovery",
    content: "Full content of nutrition blog..."
  },
  {
    id: 6,
    title: "Building Consistency: The Role of Smart Scheduling",
    category: "Lifestyle",
    content: "Full content of nutrition blog..."
  }

];

const BlogDetails = () => {
  const { id } = useParams();

  const post = posts.find((p) => p.id === Number(id));

  if (!post) {
    return <h1>Blog not found</h1>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-10">

      <Link to="/blog" className="text-primary hover:underline">
        ← Back to Blog
      </Link>

      <h1 className="text-4xl font-bold mt-6">
        {post.category}
      </h1>

      <h2 className="text-2xl mt-4">
        {post.title}
      </h2>

      <p className="mt-6 text-muted-foreground">
        {post.content}
      </p>

    </div>
  );
};

export default BlogDetails;