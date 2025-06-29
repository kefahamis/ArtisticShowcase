export default function AdminFooter() {
    const currentYear = new Date().getFullYear();
  
    return (
      <footer className="border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-lg supports-[backdrop-filter]:bg-neutral-950/60 text-gray-400">
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-4 gap-4">
          {/* Left side - Copyright */}
          <div className="flex items-center gap-2 text-sm font-light">
            <span>© {currentYear} Art Gallery Admin.</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>
  
          {/* Center - Quick Stats */}
          <div className="flex items-center gap-6 text-xs text-gray-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-gray-300 font-semibold">System Status: <span className="text-green-400">Online</span></span>
            </div>
            <span className="hidden sm:inline text-neutral-700">|</span>
            <span className="hidden sm:inline text-gray-500">Last Updated: Just now</span>
          </div>
  
          {/* Right side - Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Help
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    );
  }