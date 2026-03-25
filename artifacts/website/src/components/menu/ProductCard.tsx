import { Flame, Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@workspace/api-client-react/src/generated/api.schemas";

export function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();

  const handleOrderClick = () => {
    toast({
      title: "Get the App to Order",
      description: "Please download the Sea Gull mobile app to place orders for delivery or pickup.",
      duration: 4000,
    });
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-border/50 hover:border-secondary/30 transition-all duration-500 flex flex-col h-full">
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
            No image
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isFeatured && (
            <span className="bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm tracking-wider uppercase">
              Chef's Pick
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm tracking-wider uppercase">
              Best Seller
            </span>
          )}
          {product.isNew && (
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm tracking-wider uppercase">
              New
            </span>
          )}
        </div>

        {/* Price tag hovering over image */}
        <div className="absolute bottom-3 right-3 glass-dark text-white px-4 py-1.5 rounded-full font-bold shadow-lg">
          {product.discountedPrice ? (
            <div className="flex items-center gap-2">
              <span className="line-through text-white/60 text-xs">EGP {product.price}</span>
              <span className="text-secondary">EGP {product.discountedPrice}</span>
            </div>
          ) : (
            <span>EGP {product.price}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div>
            <h3 className="font-display font-bold text-xl text-primary leading-tight group-hover:text-secondary transition-colors">
              {product.name}
            </h3>
            {product.nameAr && (
              <p className="text-arabic text-primary/60 text-sm mt-1" dir="rtl">
                {product.nameAr}
              </p>
            )}
          </div>
          
          {product.spiceLevel && product.spiceLevel !== "none" && (
            <div className="flex gap-0.5 text-accent shrink-0 pt-1" title={`Spice Level: ${product.spiceLevel}`}>
              <Flame className="w-4 h-4 fill-current" />
              {product.spiceLevel === "hot" && <Flame className="w-4 h-4 fill-current" />}
            </div>
          )}
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center text-xs text-primary/60 font-medium">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-secondary" />
            {product.prepTime} mins
          </div>
          
          <Button 
            onClick={handleOrderClick}
            variant="ghost" 
            size="sm"
            className="text-secondary hover:text-white hover:bg-secondary rounded-full px-4 h-8 transition-all"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Order
          </Button>
        </div>
      </div>
    </div>
  );
}
