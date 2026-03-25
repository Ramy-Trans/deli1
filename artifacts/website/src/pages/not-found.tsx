import { Link } from "wouter";
import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-border/50 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Anchor className="w-10 h-10" />
          </div>
          
          <h1 className="font-display text-4xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-xl font-medium text-primary/80 mb-4">Lost at Sea</h2>
          
          <p className="text-muted-foreground mb-8">
            The page you are looking for seems to have drifted away or doesn't exist.
          </p>
          
          <Link href="/">
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-xl h-12 shadow-md hover:shadow-lg transition-all">
              Return to Safe Harbor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
