import { Link } from "react-router-dom";
import { Search, Users, Bell, ArrowRight, Heart, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/SearchBar";
import heroImage from "@/assets/hero-doctor.webp";
export default function Index() {
  return <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-background py-20 md:py-32 overflow-hidden">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 font-bold">
              Find Your Family Doctor
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10">
              2.5 million Ontarians are searching. We help you find one faster.
            </p>
            <SearchBar size="large" className="max-w-2xl mx-auto" />
            <p className="mt-4 text-sm text-muted-foreground">
              Search is always free. No signup required.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="bg-background py-20 md:py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              The Doctor Shortage Is Getting Worse
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
            <div className="text-center p-6 rounded-xl bg-background-alt">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <p className="text-4xl font-bold text-primary mb-2">2.5M</p>
              <p className="text-muted-foreground">Ontarians without a family doctor</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background-alt">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <p className="text-4xl font-bold text-primary mb-2">14.7%</p>
              <p className="text-muted-foreground">of Ontario's population</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background-alt">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-status-not-accepting/20 mb-4">
                <Clock className="h-8 w-8 text-status-not-accepting" />
              </div>
              <p className="text-4xl font-bold text-primary mb-2">4+ yrs</p>
              <p className="text-muted-foreground">average wait on Health Care Connect</p>
            </div>
          </div>
          
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Calling clinics manually takes hours with no guarantee of success. 
            There has to be a better way.
          </p>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Find Doctors. Get Alerted. Stop Searching.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-6">
                <Search className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Search Freely</h3>
              <p className="text-muted-foreground">
                Browse all family doctors. See who's accepting patients. Always free.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-6">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Community Powered</h3>
              <p className="text-muted-foreground">
                Real people update status. Doctors verify listings. Everyone helps everyone.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-6">
                <Bell className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Get Instant Alerts</h3>
              <p className="text-muted-foreground mb-4">
                Monitor 3 cities. Email when doctors accept. $7.99/month.
              </p>
              <Link to="/pricing" className="inline-flex items-center text-secondary font-medium hover:text-primary transition-colors">
                More Info <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
              <Heart className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Built by the Community. For the Community.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              FindYourDoctor works because people like you help keep it accurate. 
              Called a clinic recently? Update their status. It takes 30 seconds 
              and helps someone else find care faster.
            </p>
            <Button size="lg" asChild>
              <Link to="/doctors">Help Update a Listing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Stop Waiting. Start Finding.
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              2.5 million Ontarians need a family doctor. You could be next to find one.
            </p>
            <SearchBar size="large" className="max-w-2xl mx-auto" />
          </div>
        </div>
      </section>
    </div>;
}