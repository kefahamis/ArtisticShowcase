import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import SeoHead from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  User,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  MessageCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { type BlogPost } from "@shared/schema-old";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:id");
  const postId = params?.id;
  const { toast } = useToast();

  const [comment, setComment] = useState({
    name: "",
    email: "",
    message: "",
  });

  const { data: post, isLoading } = useQuery({
    queryKey: ["/api/blog", postId],
    enabled: !!postId,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: "Comment Submitted",
      description: "Thank you for your comment! It will be reviewed before publishing.",
    });
    setComment({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  const shareToSocial = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "Gallery Blog Post";
    const text = post?.excerpt || post?.content?.substring(0, 150) || "";

    // Record the share
    try {
      await fetch(`/api/blog/${postId}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform }),
      });
    } catch (error) {
      console.error("Error recording share:", error);
    }

    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "The post link has been copied to your clipboard.",
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
        <SeoHead
          title={post?.metaTitle || post?.title || "Blog Post"}
          description={post?.metaDescription || post?.excerpt || "Read our latest blog post"}
          type="article"
          image={post?.imageUrl}
          publishedTime={post?.createdAt}
          modifiedTime={post?.updatedAt}
        />
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center mb-12">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex items-center gap-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="w-full h-[500px] rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-gray-800 dark:text-gray-200 mb-6">
            Post Not Found
          </h1>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-black hover:text-gray-700 transition-colors dark:text-white dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        <article className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl overflow-hidden p-8 md:p-12">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-12"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </Link>

          {/* Post Header */}
          <header className="mb-12 text-center">
            <Badge
              variant="default"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold tracking-wide uppercase px-4 py-1 rounded-full mb-4 shadow-sm"
            >
              {post.category || "News"}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 dark:text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>By Gallery Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  Published on{" "}
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>5 min read</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post?.imageUrl && (
            <figure className="mb-12">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-[500px] object-cover rounded-3xl shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
              />
              {/* Optional: Add a caption */}
              {/* <figcaption className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Image caption goes here
              </figcaption> */}
            </figure>
          )}

          {/* Post Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-16 font-light leading-relaxed text-gray-800 dark:text-gray-200">
            <div
              className="whitespace-pre-wrap font-sans"
              dangerouslySetInnerHTML={{ __html: post?.content || "" }}
            />
          </div>

          {/* Share Buttons */}
          <section className="border-t border-b border-gray-200 dark:border-gray-700 py-10 mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold font-serif flex items-center justify-center md:justify-start gap-3 mb-3">
                  <Share2 className="w-7 h-7 text-primary" />
                  Share this post
                </h3>
                {post?.shareCount && (
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Join the conversation! Shared{" "}
                    <span className="font-bold">
                      {post.shareCount.total} time
                      {post.shareCount.total !== 1 ? "s" : ""}
                    </span>{" "}
                    across platforms.
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-end gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6 py-3 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
                  onClick={() => shareToSocial("facebook")}
                >
                  <Facebook className="w-5 h-5 mr-2" />
                  Facebook
                  {post?.shareCount?.facebook ? (
                    <span className="ml-2 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                      {post.shareCount.facebook}
                    </span>
                  ) : null}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6 py-3 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
                  onClick={() => shareToSocial("twitter")}
                >
                  <Twitter className="w-5 h-5 mr-2" />
                  Twitter
                  {post?.shareCount?.twitter ? (
                    <span className="ml-2 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                      {post.shareCount.twitter}
                    </span>
                  ) : null}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6 py-3 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
                  onClick={() => shareToSocial("linkedin")}
                >
                  <Linkedin className="w-5 h-5 mr-2" />
                  LinkedIn
                  {post?.shareCount?.linkedin ? (
                    <span className="ml-2 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                      {post.shareCount.linkedin}
                    </span>
                  ) : null}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-6 py-3 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
                  onClick={() => shareToSocial("copy")}
                >
                  <Link2 className="w-5 h-5 mr-2" />
                  Copy Link
                  {post?.shareCount?.copy ? (
                    <span className="ml-2 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                      {post.shareCount.copy}
                    </span>
                  ) : null}
                </Button>
              </div>
            </div>
          </section>

          {/* Comments Section */}
          <section>
            <h3 className="text-3xl font-serif font-bold mb-10 flex items-center gap-3 text-gray-900 dark:text-gray-100">
              <MessageCircle className="w-8 h-8 text-primary" />
              Leave a Comment
            </h3>

            <Card className="rounded-3xl shadow-lg border-none bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-8">
                <form onSubmit={handleCommentSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name *</label>
                      <Input
                        id="name"
                        type="text"
                        value={comment.name}
                        onChange={(e) => setComment({ ...comment, name: e.target.value })}
                        required
                        placeholder="Your name"
                        className="h-12 rounded-xl border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dark:bg-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email *</label>
                      <Input
                        id="email"
                        type="email"
                        value={comment.email}
                        onChange={(e) => setComment({ ...comment, email: e.target.value })}
                        required
                        placeholder="your@email.com"
                        className="h-12 rounded-xl border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dark:bg-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Comment *</label>
                    <Textarea
                      id="comment"
                      value={comment.message}
                      onChange={(e) => setComment({ ...comment, message: e.target.value })}
                      required
                      placeholder="Share your thoughts about this post..."
                      rows={6}
                      className="rounded-xl border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dark:bg-gray-900 dark:text-gray-100 min-h-[150px]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit Comment"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </article>
      </div>
    </div>
  );
}