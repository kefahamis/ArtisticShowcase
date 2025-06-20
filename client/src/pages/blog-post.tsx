import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { type BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:id");
  const postId = params?.id;
  const { toast } = useToast();
  
  const [comment, setComment] = useState({
    name: "",
    email: "",
    message: ""
  });

  const { data: post, isLoading } = useQuery({
    queryKey: ["/api/blog", postId],
    enabled: !!postId,
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Comment Submitted",
      description: "Thank you for your comment! It will be reviewed before publishing.",
    });
    setComment({ name: "", email: "", message: "" });
  };

  const shareToSocial = async (platform: string) => {
    const url = window.location.href;
    const title = post?.title || "Gallery Blog Post";
    const text = post?.excerpt || post?.content?.substring(0, 150) || "";

    // Record the share
    try {
      await fetch(`/api/blog/${postId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      });
    } catch (error) {
      console.error('Error recording share:', error);
    }

    let shareUrl = "";
    
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
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
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-8" />
            <Skeleton className="h-64 w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-light text-gray-600 mb-4">
            Post Not Found
          </h1>
          <Link href="/blog" className="text-black hover:text-gray-600 transition-colors">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{post.category || "News"}</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-light mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Gallery Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>5 min read</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post?.imageUrl && (
            <div className="mb-8">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Post Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div className="whitespace-pre-wrap font-light leading-relaxed text-gray-800">
              {post?.content}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="border-t border-b py-8 mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                  <Share2 className="w-5 h-5" />
                  Share this post
                </h3>
                {post?.shareCount && (
                  <p className="text-sm text-gray-600">
                    Shared {post.shareCount.total} time{post.shareCount.total !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("facebook")}
                  className="flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                  {post?.shareCount?.facebook ? (
                    <span className="ml-1 text-xs bg-gray-100 px-1 rounded">
                      {post.shareCount.facebook}
                    </span>
                  ) : null}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("twitter")}
                  className="flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                  {post?.shareCount?.twitter ? (
                    <span className="ml-1 text-xs bg-gray-100 px-1 rounded">
                      {post.shareCount.twitter}
                    </span>
                  ) : null}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("linkedin")}
                  className="flex items-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                  {post?.shareCount?.linkedin ? (
                    <span className="ml-1 text-xs bg-gray-100 px-1 rounded">
                      {post.shareCount.linkedin}
                    </span>
                  ) : null}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("copy")}
                  className="flex items-center gap-2"
                >
                  <Link2 className="w-4 h-4" />
                  Copy Link
                  {post?.shareCount?.copy ? (
                    <span className="ml-1 text-xs bg-gray-100 px-1 rounded">
                      {post.shareCount.copy}
                    </span>
                  ) : null}
                </Button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mb-12">
            <h3 className="text-2xl font-serif font-light mb-8 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Leave a Comment
            </h3>
            
            <Card>
              <CardHeader>
                <h4 className="text-lg font-medium">Share your thoughts</h4>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCommentSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <Input
                        type="text"
                        value={comment.name}
                        onChange={(e) => setComment({ ...comment, name: e.target.value })}
                        required
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <Input
                        type="email"
                        value={comment.email}
                        onChange={(e) => setComment({ ...comment, email: e.target.value })}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment *</label>
                    <Textarea
                      value={comment.message}
                      onChange={(e) => setComment({ ...comment, message: e.target.value })}
                      required
                      placeholder="Share your thoughts about this post..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                    Submit Comment
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}