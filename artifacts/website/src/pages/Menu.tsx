import { useState } from "react";
import { useGetCategories, useGetProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/menu/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories, isLoading: isLoadingCategories } = useGetCategories();
  
  // Using the hook with dynamic parameters based on state
  const { data: products, isLoading: isLoadingProducts } = useGetProducts({
    categoryId: selectedCategory || undefined,
    search: searchQuery || undefined
  });

  // Sort categories by sortOrder if available
  const sortedCategories = categories ? [...categories].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Menu Header */}
      <div className="bg-primary text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] mix-blend-multiply opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Our Menu</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Explore our wide selection of fresh, masterfully prepared seafood. From classic grilled fish to indulgent lobster thermidor.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          
          {/* Categories Scroll */}
          <div className="w-full md:w-auto overflow-x-auto pb-4 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                  selectedCategory === null
                    ? "bg-secondary text-white shadow-md"
                    : "bg-white text-primary border border-border/50 hover:border-secondary hover:text-secondary shadow-sm"
                }`}
              >
                All Items
              </button>
              
              {isLoadingCategories ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="w-24 h-10 bg-muted rounded-full animate-pulse"></div>
                ))
              ) : (
                sortedCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? "bg-secondary text-white shadow-md"
                        : "bg-white text-primary border border-border/50 hover:border-secondary hover:text-secondary shadow-sm"
                    }`}
                  >
                    <span>{category.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search dishes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full border-border/50 shadow-sm focus:border-secondary focus:ring-secondary/20 bg-white"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="min-h-[400px]">
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-96 bg-white rounded-2xl animate-pulse shadow-sm border border-border/30"></div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {products.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold text-primary mb-2">No dishes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your category filter or search term.
              </p>
              {(selectedCategory !== null || searchQuery !== "") && (
                <button 
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery("");
                  }}
                  className="mt-6 text-secondary font-medium hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
