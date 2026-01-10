import { Link } from "react-router-dom";
import { Search, Users, Bell, ArrowRight, Heart, Clock, TrendingUp, CheckCircle, Map, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroImage from "@/assets/black-couple.jpg";
import communityImage from "@/assets/community.png";

export default function Index() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-background overflow-hidden min-h-[550px] md:min-h-[650px] flex items-end">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="" 
            className="w-full h-full object-cover object-[70%_center]"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 w-full pb-12 md:pb-16">
          <div className="max-w-xl text-left animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight" style={{ color: '#FFFFFF' }}>
              Find Your Family Doctor in Ontario
            </h1>
            <p className="text-lg md:text-xl mb-8" style={{ color: '#FFFFFF' }}>
              2.5 million Ontarians are searching. We help you find one faster.
            </p>
            <SearchBar size="large" className="max-w-md mb-4" />
            <p className="text-sm" style={{ color: '#FFFFFF', opacity: 0.9 }}>
              Always free to search. No signup required.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="bg-background py-20 md:py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-primary mb-6">
              The Doctor Shortage Is Getting Worse
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
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
              <p className="text-4xl font-bold text-primary mb-2">52%</p>
              <p className="text-muted-foreground">of family doctors considering retirement in next 5 years</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background-alt">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-status-not-accepting/20 mb-4">
                <Map className="h-8 w-8 text-status-not-accepting" />
              </div>
              <p className="text-4xl font-bold text-primary mb-2">670K</p>
              <p className="text-muted-foreground">Ontarians travel 50+ km to see their family doctor</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-background-alt">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <p className="text-4xl font-bold text-primary mb-2">1.74M</p>
              <p className="text-muted-foreground">patients have a doctor over age 65, nearing retirement</p>
            </div>
          </div>
          
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Finding a family doctor in Ontario has become increasingly difficult. While registration systems exist, they can take years. Calling clinics one by one takes hours with no guarantee of success. The challenge is real, and it's growing.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-primary mb-4">
              Find Doctors. Get Alerted. Stop Searching.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-6">
                <Search className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl text-foreground mb-3">Search Freely</h3>
              <p className="text-muted-foreground">
                Browse all family doctors accepting patients in your area. See real-time status updates. Always free to search.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-6">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl text-foreground mb-3">Community Powered</h3>
              <p className="text-muted-foreground">
                Real people update doctor status after calling clinics. Doctors can verify their listings. Everyone helps everyone find care faster.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-6">
                <Bell className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl text-foreground mb-3">Get Instant Alerts</h3>
              <p className="text-muted-foreground mb-4">
                Monitor up to 3 cities with optional language and accessibility filters. Get email alerts when doctors matching your preferences start accepting patients. $7.99/month.
              </p>
              <Link 
                to="/pricing" 
                className="inline-flex items-center text-secondary font-medium hover:text-primary transition-colors"
              >
                Learn More About Alerts <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why FindYourDoctor Section */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-primary mb-4">
              Why FindYourDoctor Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-6">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl text-foreground mb-3">Always Up-to-Date</h3>
              <p className="text-muted-foreground">
                Community members update doctor status after calling clinics. Information stays current because people like you keep it accurate.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-6">
                <Map className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl text-foreground mb-3">Covers All of Ontario</h3>
              <p className="text-muted-foreground">
                From Toronto to Thunder Bay, we're building Ontario's most comprehensive directory of family doctors accepting new patients.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-6">
                <Clock className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl text-foreground mb-3">Saves You Time</h3>
              <p className="text-muted-foreground">
                Stop calling dozens of clinics hoping for a "yes." See who's accepting at a glance. Get alerts when new spots open.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-6">
                <Shield className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl text-foreground mb-3">Built for Everyone</h3>
              <p className="text-muted-foreground">
                Free search means everyone can look. Optional alerts help you act fast when new opportunities arise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-background-alt pt-20 md:pt-24 pb-0">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-6">
              <Heart className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl text-primary mb-6">
              Built by the Community. For the Community.
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              FindYourDoctor works because people like you keep it accurate. Called a clinic recently? Update their status—it takes 30 seconds and helps someone find care faster.
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Like you, 2.5 million Ontarians need a family doctor. Your update helps someone in your community get one step closer.
            </p>
            <Button size="lg" asChild>
              <Link to="/doctors">Help Update a Listing</Link>
            </Button>
          </div>
          
          {/* Image at bottom, flush with no bottom padding */}
          <div className="flex justify-center">
            <img 
              src={communityImage} 
              alt="Community illustration" 
              className="w-full max-w-5xl h-auto"
            />
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl text-primary mb-4">
              How to Use FindYourDoctor
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-secondary">1</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl text-primary mb-3">Search Your Area</h3>
                <p className="text-lg text-muted-foreground mb-3">
                  Enter your city or postal code. Browse family doctors in your area. Filter by location and accepting status.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-secondary">2</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl text-primary mb-3">Call to Confirm</h3>
                <p className="text-lg text-muted-foreground mb-3">
                  When you find a doctor accepting patients, call their clinic directly to confirm availability and book an appointment.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-secondary">3</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl text-primary mb-3">Help the Community</h3>
                <p className="text-lg text-muted-foreground mb-3">
                  After calling, update the doctor's status. Your 30-second update helps the next person searching.
                </p>
              </div>
            </div>
            
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-8 mt-8">
              <h4 className="text-xl text-foreground mb-3 flex items-center gap-2">
                <Bell className="h-5 w-5 text-accent" />
                Optional: Get Alerts
              </h4>
              <p className="text-muted-foreground">
                Want to be notified the moment a doctor starts accepting? Set up email alerts for up to 3 cities. $7.99/month.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-primary mb-4">
              Common Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem 
                value="item-0"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Is FindYourDoctor really free?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Searching our doctor directory is completely free and always will be. You can browse doctors, see who's accepting patients, and use the map without creating an account. We offer optional email alerts ($7.99/month) for people who want to be notified immediately when doctors start accepting patients in their area.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-1"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  How do you keep doctor information up-to-date?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Our community of users updates doctor status after calling clinics. When someone calls a clinic and learns whether they're accepting patients, they can update that information on FindYourDoctor. Doctors can also verify and update their own listings. This community-powered approach helps keep information current and helps everyone searching find care faster.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-2"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Are you affiliated with the government or CPSO?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. We are not affiliated with or endorsed by any government agency, health authority, or the College of Physicians and Surgeons of Ontario (CPSO). We are an independent community resource built to help Ontarians navigate the family doctor shortage.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-3"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  How are email alerts different from free search?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Free search lets you browse doctors whenever you want. Email alerts actively monitor doctors in your chosen cities and notify you the moment one starts accepting patients—so you can be among the first to call.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-4"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I filter alerts by language or accessibility?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! Alert Service subscribers can set optional filters for languages and accessibility features. Only doctors matching your preferences will trigger alerts, saving you time.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-5"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  What should I do in a medical emergency?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  FindYourDoctor helps you find a family doctor for ongoing care. For immediate medical needs: Call 911 for emergencies, visit a walk-in clinic or emergency department for urgent care, or call Telehealth Ontario at 1-866-797-0000 for health advice.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-6"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Can doctors update their own listings?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Doctors can search for their name, find their listing, and update it directly to ensure accuracy.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-primary mb-4">
              Trusted by Ontarians Searching for Care
            </h2>
            <p className="text-muted-foreground">
              Our community is growing every day as more people join to help each other find family doctors.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl text-primary mb-4">
              We're Here to Help You Find Care
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Finding a family doctor takes time and effort, but you don't have to search alone. Our community is here to support you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <h3 className="text-2xl text-foreground mb-3">Start Searching Now</h3>
              <p className="text-muted-foreground mb-6">
                Browse doctors, see who's accepting patients, and call clinics.
              </p>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  No signup required
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  Always free
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  Instant access
                </li>
              </ul>
              <Button size="lg" className="w-full" asChild>
                <Link to="/doctors">Start Your Search</Link>
              </Button>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <h3 className="text-2xl text-foreground mb-3">Get Notified Instantly</h3>
              <p className="text-muted-foreground mb-6">
                Monitor up to 3 cities and receive alerts when doctors start accepting.
              </p>
              <ul className="text-left space-y-2 mb-6 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  $7.99/month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  Cancel anytime
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-status-accepting flex-shrink-0" />
                  Time advantage
                </li>
              </ul>
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
