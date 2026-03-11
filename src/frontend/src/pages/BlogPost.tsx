import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useActor } from "../hooks/useActor";

export default function BlogPostPage() {
  const { id } = useParams({ from: "/blog/$id" });
  const { actor } = useActor();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blogPost", id],
    queryFn: () => actor!.getBlogPost(id),
    enabled: !!actor,
  });

  if (isLoading)
    return (
      <div
        className="text-center py-20 text-muted-foreground"
        data-ocid="blog_post.loading_state"
      >
        Loading article...
      </div>
    );
  if (!post)
    return (
      <div
        className="text-center py-20 text-muted-foreground"
        data-ocid="blog_post.error_state"
      >
        Article not found.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/blog">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          data-ocid="blog_post.back.button"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Resources
        </Button>
      </Link>
      <span className="text-xs text-primary font-medium">{post.category}</span>
      <h1 className="text-3xl font-bold mt-2 mb-4">{post.title}</h1>
      <div className="text-sm text-muted-foreground mb-8">
        By {post.author} &bull;{" "}
        {new Date(Number(post.createdAt) / 1_000_000).toLocaleDateString()}
      </div>
      <div className="prose prose-blue max-w-none">
        {post.content.split("\n").map((para, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static paragraph split
          <p key={`para-${i}`} className="mb-4 text-foreground leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
