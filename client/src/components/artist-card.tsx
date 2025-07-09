import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "wouter";
import type { Artist } from "@shared/schema-old";

interface ArtistCardProps {
  artist: Artist;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/artists/${artist.id}`}>
      <Card className="group cursor-pointer border-0 shadow-none hover:shadow-lg transition-all duration-300 bg-white text-center">
        <CardContent className="p-8 space-y-6">
          <div className="relative">
            <div className="w-32 h-32 mx-auto relative overflow-hidden rounded-full">
              <img
                src={artist.imageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face`}
                alt={artist.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            {artist.featured && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-black text-white text-xs px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 mr-1" />
                  FEATURED
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-light text-gray-900 group-hover:text-black transition-colors">
                {artist.name}
              </h3>
              <p className="text-sm text-gray-600 font-light tracking-wide uppercase">
                {artist.specialty}
              </p>
            </div>

            <p className="text-sm text-gray-700 font-light leading-relaxed line-clamp-3">
              {artist.bio}
            </p>
          </div>

          <Button
            variant="outline"
            className="group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300 font-medium tracking-widest uppercase text-xs px-6 py-2"
          >
            VIEW PROFILE
            <ArrowRight className="ml-2 w-3 h-3" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}