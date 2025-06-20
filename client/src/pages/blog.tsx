import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User } from "lucide-react";
import { type BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/blog"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-light mb-6">
              Gallery News & Insights
            </h1>
            <p className="text-xl text-gray-600 font-light leading-relaxed">
              Stay updated with the latest exhibitions, artist features, and art world insights from our gallery.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden shadow-lg">
                  <Skeleton className="h-64 w-full" />
                  <CardHeader className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : Array.isArray(posts) && posts.length > 0 ? (
              posts
                .filter((post: BlogPost) => post.published)
                .map((post: BlogPost) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg">
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                          <div className="text-center">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm font-light">Gallery News</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium">
                          News
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-6">
                      <CardTitle className="text-xl font-serif font-light line-clamp-2 leading-tight mb-3">
                        {post.title}
                      </CardTitle>
                      <p className="text-gray-600 font-light line-clamp-3 leading-relaxed">
                        {post.excerpt || post.content.substring(0, 150) + "..."}
                      </p>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Recent"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            5 min read
                          </div>
                        </div>
                        <Link
                          href={`/blog/${post.id}`}
                          className="inline-flex items-center text-black hover:text-gray-600 transition-colors font-medium text-sm uppercase tracking-wide border-b border-black hover:border-gray-600"
                        >
                          Read More
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="max-w-md mx-auto">
                  <User className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-3xl font-serif font-light text-gray-600 mb-4">
                    Coming Soon
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    We're preparing exciting content about our artists, exhibitions, and the art world. 
                    Check back soon for the latest gallery news and insights.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}