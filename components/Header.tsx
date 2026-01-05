export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
          <span className="text-gray-900">PortfolioForge</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Pricing
          </a>
          <a
            href="#docs"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Docs
          </a>
          <button className="bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all hover:shadow-lg">
            Get Started
          </button>
        </nav>
      </div>
    </header>
  );
}
