import { Link } from "wouter";
import { ArrowRight, Star, ChefHat, MapPin, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/menu/ProductCard";
import { motion } from "framer-motion";

export default function Home() {
  const { data: products, isLoading } = useGetProducts({ featured: true });

  const featuredProducts = products?.slice(0, 3) || [];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40 z-10" />
          <img 
            src={`${import.meta.env.BASE_URL}images/hero.png`}
            alt="Sea Gull Restaurant Dining" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[1px] w-12 bg-secondary block"></span>
              <span className="text-secondary font-medium tracking-widest uppercase text-sm">Est. 1998 • Cairo</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] mb-6 drop-shadow-lg">
              The Finest <br/><span className="text-secondary italic">Seafood</span> Experience
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-lg leading-relaxed font-light">
              Discover the ocean's greatest treasures, masterfully prepared and served in an elegant coastal atmosphere right in the heart of Egypt.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/menu">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white rounded-full px-8 text-base shadow-xl hover:shadow-secondary/20 h-14">
                  Explore Menu
                </Button>
              </Link>
              <Link href="/branches">
                <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 rounded-full px-8 text-base backdrop-blur-sm h-14">
                  Find a Branch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-70"
        >
          <span className="text-white text-xs tracking-widest uppercase font-medium">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-secondary to-transparent"></div>
        </motion.div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-5 h-5 text-secondary" />
                <span className="text-secondary font-medium tracking-widest uppercase text-sm">Chef's Selection</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary">Signature Dishes</h2>
            </div>
            <Link href="/menu" className="group flex items-center gap-2 text-primary font-medium hover:text-secondary transition-colors">
              View full menu 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted/50 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Story/Atmosphere Section */}
      <section className="py-24 bg-primary text-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none transform translate-x-1/3 -translate-y-1/3">
          <Anchor className="w-96 h-96" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-secondary fill-secondary" />
                <span className="text-secondary font-medium tracking-widest uppercase text-sm">Our Heritage</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 leading-tight">
                A Legacy of <br/>Coastal Flavors
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8">
                Since 1998, Sea Gull has been Cairo's premier destination for authentic, high-quality seafood. We source our catches daily to ensure the freshest experience, preparing each dish with recipes that have been perfected over decades.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-10 border-t border-white/10 pt-8">
                <div>
                  <h4 className="font-display text-3xl font-bold text-secondary mb-2">25+</h4>
                  <p className="text-white/60 text-sm">Years of culinary excellence</p>
                </div>
                <div>
                  <h4 className="font-display text-3xl font-bold text-secondary mb-2">3</h4>
                  <p className="text-white/60 text-sm">Premium locations in Cairo</p>
                </div>
              </div>
              <Link href="/about">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full h-12 px-8">
                  Read Our Story
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10 border-8 border-white/5">
                <img 
                  src={`${import.meta.env.BASE_URL}images/about.png`} 
                  alt="Restaurant Interior" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-secondary rounded-full blur-3xl opacity-20 -z-10"></div>
              <div className="absolute -top-6 -right-6 w-48 h-48 bg-blue-500 rounded-full blur-3xl opacity-20 -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* App CTA Section */}
      <section className="py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-10 md:p-16 shadow-2xl text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/images/pattern.png')] mix-blend-overlay opacity-20"></div>
            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <Anchor className="w-12 h-12 text-secondary mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Craving Sea Gull at Home?</h2>
              <p className="text-white/80 text-lg mb-8">
                Download our mobile app to order your favorite seafood for delivery or schedule a pickup from any of our branches.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                <Button className="bg-white text-primary hover:bg-white/90 h-14 px-8 rounded-xl font-bold tracking-wide shadow-lg">
                  Download for iOS
                </Button>
                <Button className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 h-14 px-8 rounded-xl font-bold tracking-wide">
                  Download for Android
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
