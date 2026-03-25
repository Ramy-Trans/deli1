import { Link } from "wouter";
import { Anchor, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t-[6px] border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-secondary text-white p-2 rounded-full">
                <Anchor className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-2xl tracking-widest text-white">
                SEA GULL
              </span>
            </div>
            <p className="text-primary-foreground/70 leading-relaxed text-sm">
              Experience the finest seafood dining in Cairo. Fresh catches, masterful preparation, and an unforgettable coastal atmosphere right in the heart of the city.
            </p>
            <div className="flex gap-4 pt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-white transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-white transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-white transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-xl mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-primary-foreground/70 hover:text-secondary transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300">Home</Link></li>
              <li><Link href="/menu" className="text-primary-foreground/70 hover:text-secondary transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300">Our Menu</Link></li>
              <li><Link href="/branches" className="text-primary-foreground/70 hover:text-secondary transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300">Locations</Link></li>
              <li><Link href="/about" className="text-primary-foreground/70 hover:text-secondary transition-colors inline-flex items-center gap-2 hover:translate-x-1 duration-300">Our Story</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-xl mb-6 text-white">Main Branch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-primary-foreground/70">
                <MapPin className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed">26 Sharia Hassan Sabri<br/>Zamalek, Cairo, Egypt</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-sm">+20 2 2738-1234</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/70">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-sm">hello@seagull.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-xl mb-6 text-white">Opening Hours</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Monday - Thursday</span>
                <span className="text-white">12:00 PM - 11:30 PM</span>
              </li>
              <li className="flex justify-between border-b border-white/10 pb-2">
                <span>Friday</span>
                <span className="text-white">1:00 PM - 12:00 AM</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Saturday - Sunday</span>
                <span className="text-white">12:00 PM - 12:00 AM</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Sea Gull Restaurant. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
