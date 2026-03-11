import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { BlogPost } from "../backend";
import { useActor } from "../hooks/useActor";

const SAMPLE_POSTS: Omit<BlogPost, "id">[] = [
  {
    title: "Understanding Your Rights in a Property Dispute",
    content:
      "Property disputes are one of the most common legal issues in India. This guide covers the key laws, procedures, and your rights as a property owner or tenant. Learn about the Transfer of Property Act, how to file a complaint, and when to seek legal advice.",
    author: "LegalConnect Team",
    category: "Property Law",
    createdAt: BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000) * 1_000_000n,
  },
  {
    title: "How to Choose the Right Lawyer for Your Case",
    content:
      "Selecting the right lawyer can make or break your case. Key factors to consider include specialization, experience, communication style, fees, and track record. This article walks you through a step-by-step approach to finding the best legal representation.",
    author: "LegalConnect Team",
    category: "Legal Advice",
    createdAt: BigInt(Date.now() - 14 * 24 * 60 * 60 * 1000) * 1_000_000n,
  },
  {
    title: "Consumer Rights in India: What You Must Know",
    content:
      "The Consumer Protection Act 2019 greatly strengthened consumer rights in India. From defective products to unfair trade practices, this article explains what protections are available, how to file a complaint with consumer forums, and how to get compensation.",
    author: "LegalConnect Team",
    category: "Consumer Law",
    createdAt: BigInt(Date.now() - 21 * 24 * 60 * 60 * 1000) * 1_000_000n,
  },
];

export default function Blog() {
  const { actor } = useActor();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      if (!actor) return [];
      const existing = await actor.listBlogPosts();
      if (existing.length === 0) {
        for (const p of SAMPLE_POSTS) {
          await actor.createBlogPost({ ...p, id: crypto.randomUUID() });
        }
        return actor.listBlogPosts();
      }
      return existing;
    },
    enabled: !!actor,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Legal Resources</h1>
      <p className="text-muted-foreground mb-10">
        Articles and guides to help you understand your legal rights.
      </p>
      {isLoading ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="blog.loading_state"
        >
          Loading articles...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              to="/blog/$id"
              params={{ id: post.id }}
              data-ocid={`blog.post.item.${i + 1}`}
            >
              <div className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-shadow h-full flex flex-col">
                <span className="text-xs text-primary font-medium mb-2">
                  {post.category}
                </span>
                <h3 className="font-semibold text-lg mb-2 leading-tight">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground flex-1 line-clamp-3">
                  {post.content.substring(0, 120)}...
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  {new Date(
                    Number(post.createdAt) / 1_000_000,
                  ).toLocaleDateString()}{" "}
                  &bull; {post.author}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
