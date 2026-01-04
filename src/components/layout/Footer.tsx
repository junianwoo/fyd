import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

const footerLinks = {
  site: [
    { label: "Find Doctors", href: "/doctors" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Resources", href: "/resources" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Disclaimer Section */}
      <div className="border-b border-primary-foreground/20">
        <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
          <p className="text-sm text-primary-foreground/90 mb-4">
            FindYourDoctor.ca helps Ontarians search for family doctors accepting 
            new patients and provides optional email alerts when doctors in your 
            area start accepting.
          </p>
          <div className="flex items-center justify-center gap-2 text-accent">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">
              IMPORTANT: We are not affiliated with or endorsed by any government 
              agency, health authority, or the College of Physicians and Surgeons 
              of Ontario (CPSO).
            </p>
          </div>
          <p className="text-xs text-primary-foreground/70 mt-3">
            For immediate medical care, visit a walk-in clinic or emergency department. 
            Call 911 for emergencies.
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img 
                src={logoWhite} 
                alt="FindYourDoctor.ca" 
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-primary-foreground/80 max-w-sm">
              Helping Ontarians find family doctors accepting new patients. 
              Community-powered, always up-to-date.
            </p>
            <p className="text-sm text-primary-foreground/60 mt-4">
              Email: support@findyourdoctor.ca
            </p>
          </div>

          {/* Site Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Site</h4>
            <ul className="space-y-2">
              {footerLinks.site.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} FindYourDoctor.ca. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
