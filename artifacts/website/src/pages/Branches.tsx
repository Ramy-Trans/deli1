import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { useGetBranches } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Branches() {
  const { data: branches, isLoading } = useGetBranches();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] mix-blend-multiply opacity-20"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Our Locations</h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Find a Sea Gull Restaurant near you. We're proud to serve Cairo's finest seafood across three premium locations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-white rounded-2xl animate-pulse shadow-sm border border-border/30"></div>
            ))}
          </div>
        ) : branches && branches.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {branches.map((branch, index) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Branch Header */}
                <div className="bg-primary/5 p-6 border-b border-border/50">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-primary mb-1">{branch.name}</h2>
                  <p className="text-arabic text-primary/60 text-sm" dir="rtl">{branch.nameAr}</p>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-grow gap-6">
                  
                  <div className="flex gap-3 items-start">
                    <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary mb-1">Address</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">{branch.address}</p>
                      <p className="text-muted-foreground text-sm mt-1">{branch.area}, {branch.city}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <Phone className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary mb-1">Contact</p>
                      <p className="text-muted-foreground text-sm">{branch.phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-primary mb-1">Hours</p>
                      <p className="text-muted-foreground text-sm">Mon-Thu: 12 PM - 11:30 PM</p>
                      <p className="text-muted-foreground text-sm">Fri-Sun: 12 PM - 12:00 AM</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex gap-3">
                    <Button className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-xl shadow-md">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Branch
                    </Button>
                    {branch.latitude && branch.longitude && (
                      <Button variant="outline" className="w-full border-border hover:bg-primary/5 rounded-xl">
                        <Navigation className="w-4 h-4 mr-2 text-primary" />
                        Directions
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            No branches information available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
