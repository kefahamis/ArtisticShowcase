export default function AdminFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white/50 backdrop-blur supports-[backdrop-filter]:bg-white/30">
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-4">
        {/* Left side - Copyright */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>© {currentYear} Art Gallery Admin.</span>
          <span>All rights reserved.</span>
        </div>

        {/* Center - Quick Stats */}
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <span>System Status: Online</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Last Updated: Just now</span>
        </div>

        {/* Right side - Links */}
        <div className="flex items-center gap-4 text-sm">
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            Help
          </button>
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            Support
          </button>
          
        </div>
      </div>
    </footer>
  );
}