import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X } from "lucide-react";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageZoom({ src, alt, className = "" }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed) {
      setZoomLevel(2);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoomLevel(1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || zoomLevel <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 100;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 100;
    
    setPosition({ x: -x, y: -y });
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        <div 
          className="overflow-hidden cursor-zoom-in"
          onClick={handleZoomToggle}
          onMouseMove={handleMouseMove}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-96 object-cover transition-transform duration-300"
            style={{
              transform: isZoomed 
                ? `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`
                : 'scale(1)'
            }}
          />
        </div>
        
        {/* Zoom button overlay */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white"
            onClick={handleZoomToggle}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Zoomed modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-screen p-4">
            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleZoomToggle}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoomed image */}
            <div 
              className="overflow-hidden cursor-move"
              onMouseMove={handleMouseMove}
            >
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-screen object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
