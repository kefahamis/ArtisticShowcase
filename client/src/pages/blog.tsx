import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, ArrowRight, Rss, Loader2 } from "lucide-react";
import { type BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/blog"],
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 lg:px-12 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-serif font-extrabold text-gray-900 leading-tight mb-6">
              Gallery News & Insights
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
              Stay updated with the latest exhibitions, artist features, and insights from the vibrant world of art.
            </p>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-6 lg:px-12 py-20">
        {/* Blog Posts Grid */}
        <section className="pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {isLoading ? (
              // Loading state with 6 skeleton cards
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden rounded-3xl shadow-lg border-none animate-pulse">
                  <Skeleton className="h-64 w-full rounded-b-none" />
                  <CardHeader className="p-8 space-y-4">
                    <Skeleton className="h-5 w-24 rounded-full" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : Array.isArray(posts) && posts.length > 0 ? (
              // Display published posts
              posts
                .filter((post: BlogPost) => post.published)
                .map((post: BlogPost) => (
                  <Link href={`/blog/${post.id}`} key={post.id} className="block group">
                    <Card className="overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-none">
                      {/* Image container with aspect ratio and hover effect */}
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          // Image placeholder
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                            <div className="text-center text-gray-300">
                              <Rss className="w-20 h-20 mx-auto opacity-70" />
                              <p className="mt-2 text-sm">No Image</p>
                            </div>
                          </div>
                        )}
                        {/* Category badge */}
                        <div className="absolute top-6 left-6 z-10">
                          <Badge className="bg-white text-gray-800 font-semibold px-4 py-1 rounded-full shadow-md backdrop-blur-sm bg-opacity-80">
                            {post.category || "General"}
                          </Badge>
                        </div>
                      </div>

                      {/* Card Content */}
                      <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-3xl font-serif font-bold line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">
                          {post.title}
                        </CardTitle>
                        <p className="text-gray-600 font-light line-clamp-3 mt-3 leading-relaxed">
                          {post.excerpt || (post.content ? post.content.substring(0, 150) + "..." : "No excerpt available.")}
                        </p>
                      </CardHeader>
                      <CardContent className="px-8 pb-8">
                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) : "Date TBD"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">5 min read</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
            ) : (
              // Empty state when no posts are available
              <div className="col-span-full text-center py-24">
                <div className="max-w-xl mx-auto">
                  <Rss className="w-24 h-24 text-gray-300 mx-auto mb-8" />
                  <h3 className="text-4xl font-serif font-bold text-gray-700 mb-6">
                    Fresh Content is on the Way!
                  </h3>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    We're currently curating a collection of fascinating articles, artist spotlights, and exhibition highlights. Check back soon to explore our latest stories.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}