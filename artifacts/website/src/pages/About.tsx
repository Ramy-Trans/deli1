import { Anchor, Award, Users, Utensils } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-primary/70 z-10" />
          <img 
            src={`${import.meta.env.BASE_URL}images/about.png`} 
            alt="Sea Gull Interior" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Anchor className="w-12 h-12 text-secondary mx-auto mb-6" />
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-md">Our Story</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
              A journey of passion, perfection, and the relentless pursuit of the finest seafood in Egypt.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="prose prose-lg prose-slate mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl text-primary font-bold mb-6">The Sea Gull Legacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Established in 1998, Sea Gull Restaurant was born out of a profound love for the ocean's bounty. What started as a humble eatery in Zamalek has grown into Cairo's most distinguished seafood institution, while maintaining the intimate, family-run warmth that defined our early days.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-3xl shadow-sm border border-border/50"
            >
              <Utensils className="w-10 h-10 text-secondary mb-4" />
              <h3 className="font-display text-2xl font-bold text-primary mb-3">Our Culinary Philosophy</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We believe great seafood requires minimal interference. Our master chefs prepare each dish to highlight, not mask, the natural flavors of the premium catches we source daily. Every herb, spice, and garnish is meticulously selected.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-3xl shadow-sm border border-border/50"
            >
              <Award className="w-10 h-10 text-secondary mb-4" />
              <h3 className="font-display text-2xl font-bold text-primary mb-3">Uncompromising Quality</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Quality is the cornerstone of our reputation. We work directly with trusted local fishermen and sustainable suppliers to ensure only the highest grade of seafood enters our kitchens. Our rigorous standards guarantee a perfect dining experience.
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary text-white p-10 md:p-16 rounded-3xl text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/images/pattern.png')] mix-blend-multiply opacity-20"></div>
            <div className="relative z-10">
              <Users className="w-12 h-12 text-secondary mx-auto mb-6" />
              <h2 className="font-display text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Experience the Sea Gull standard for yourself. Whether for a family celebration, a business lunch, or an elegant dinner, we look forward to welcoming you.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
