import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Branches", path: "/branches" },
    { name: "Our Story", path: "/about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "py-3 glass" : "py-5 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-secondary text-white p-2 rounded-full shadow-md group-hover:scale-110 transition-transform duration-300">
              <Anchor className="w-5 h-5" />
            </div>
            <span className={`font-display font-bold text-2xl tracking-wider ${isScrolled ? 'text-primary' : 'text-primary md:text-primary'} transition-colors`}>
              SEA GULL
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`font-medium text-sm uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.5 ${
                  location === link.path
                    ? "text-secondary font-bold"
                    : isScrolled
                    ? "text-primary/80 hover:text-primary"
                    : "text-primary/90 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link href="/menu">
              <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border-none font-medium tracking-wide">
                Order Now
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t mt-3"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl text-center font-medium ${
                    location === link.path
                      ? "bg-primary/5 text-primary"
                      : "text-primary/70"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
