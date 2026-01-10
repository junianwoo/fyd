import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Search, Bell, ArrowRight, Loader2, Shield, CreditCard, Clock, Heart, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const freeFeatures = [
  "Browse all family doctors in Ontario",
  "See real-time accepting status",
  "Access contact information",
  "View community updates",
  "Search as often as you like",
  "Use the interactive map",
];

const alertFeatures = [
  "Everything in Free, Plus:",
  "Email alerts for up to 3 cities",
  "Optional language and accessibility filters",
  "Instant notifications when status changes to 'Accepting'",
  "Monitor multiple locations (for yourself and loved ones)",
  "Cancel anytime, no long-term commitment",
];

const emailSchema = z.string().email("Please enter a valid email address");

export default function Pricing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [userStatus, setUserStatus] = useState<string | null>(null);

  // Check if user is already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();
        
        setUserStatus(profile?.status || null);
      }
    };

    checkSubscription();
  }, [user]);

  const isSubscribed = userStatus === "alert_service" || userStatus === "assisted_access";

  const handleSubscribe = () => {
    // If already subscribed, redirect to dashboard
    if (isSubscribed) {
      toast({
        title: "Already subscribed",
        description: "You already have an active subscription. Redirecting to your dashboard...",
        variant: "default",
      });
      setTimeout(() => window.location.href = "/dashboard", 1500);
      return;
    }

    setShowEmailDialog(true);
    setEmail("");
    setEmailError("");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    try {
      emailSchema.parse(email);
      setEmailError("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { email },
      });

      if (error) throw error;
      
      // Check if user already has a subscription
      if (data?.error) {
        toast({
          title: "Already subscribed",
          description: data.error,
          variant: "destructive",
        });
        setLoading(false);
        setShowEmailDialog(false);
        if (data.redirectUrl) {
          setTimeout(() => window.location.href = data.redirectUrl, 2000);
        }
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error starting checkout",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Email Collection Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Email</DialogTitle>
            <DialogDescription>
              We'll create your account automatically after payment. You'll receive a confirmation email with your login details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={emailError ? "border-destructive pl-10" : "pl-10"}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>
            <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
              <p className="text-xs text-muted-foreground">
                <strong>What happens next:</strong> You'll be redirected to secure checkout. After payment, we'll create your account and email you the login details.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmailDialog(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Continue to Checkout"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hero */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl text-primary mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Search for free, or get alerts when doctors start accepting patients. Choose what works for you.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 mb-4">
                  <Search className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-2xl">Free Search</CardTitle>
                <p className="text-muted-foreground">Always free, no signup required</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-4xl font-bold text-foreground">
                  $0
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-foreground mb-3">What's Included:</p>
                  <ul className="space-y-2">
                    {freeFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-background-alt p-4 rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-1">Best For:</p>
                  <p className="text-sm text-muted-foreground">
                    People who want to manually check for accepting doctors on their own schedule.
                  </p>
                </div>

                <Button variant="outline" className="w-full" size="lg" asChild>
                  <Link to="/doctors">Start Searching for Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Alert Service */}
            <Card className="relative overflow-hidden border-secondary shadow-lg">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                RECOMMENDED
              </div>
              <CardHeader className="pb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-4">
                  <Bell className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-2xl">Alert Service</CardTitle>
                <p className="text-muted-foreground">Get notified instantly when doctors start accepting</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-4xl font-bold text-foreground">
                  $7.99
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                
                <div>
                  <ul className="space-y-2">
                    {alertFeatures.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-status-accepting flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                  <p className="text-sm font-semibold text-foreground mb-1">Best For:</p>
                  <p className="text-sm text-muted-foreground">
                    People actively searching who want to be among the first to call when opportunities arise, or those helping family members in other cities.
                  </p>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubscribe} disabled={loading || isSubscribed}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : isSubscribed ? (
                    "Already Subscribed - Go to Dashboard"
                  ) : (
                    "Subscribe to Alert Service"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl text-primary mb-4">
                Why Alert Service?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl text-foreground mb-3">Time Advantage</h3>
                <p className="text-muted-foreground">
                  When a doctor starts accepting patients, their roster can fill within hours or days. Alert Service ensures you're notified immediately, giving you the best chance to call before spots are filled.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl text-foreground mb-3">Help Loved Ones</h3>
                <p className="text-muted-foreground">
                  Use your 3 city slots to help aging parents, family members, or friends find doctors in their area. Many subscribers monitor multiple cities for this exact reason.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl text-foreground mb-3">Set It and Forget It</h3>
                <p className="text-muted-foreground">
                  Set your locations and optional filters (language, accessibility), then let Alert Service do the monitoring for you. You'll only hear from us when there's a doctor worth calling about.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                  <ArrowRight className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl text-foreground mb-3">Cancel Anytime</h3>
                <p className="text-muted-foreground">
                  No long-term contracts. No cancellation fees. If you find a doctor or decide alerts aren't for you, cancel with one click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assisted Access Section */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl text-primary mb-6">
              Need Help Affording Alert Service?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              We believe everyone deserves access to tools that help them find healthcare. If $7.99/month is a barrier for you, we offer Assisted Access.
            </p>
            
            <div className="bg-card p-8 rounded-lg border border-border text-left mb-8">
              <h3 className="text-xl text-foreground mb-3">What Is Assisted Access?</h3>
              <p className="text-muted-foreground mb-4">
                Assisted Access provides free Alert Service to those facing financial barriers. We don't ask for proof or documentation. We trust you to assess your own situation.
              </p>
              <Button size="lg" asChild>
                <Link to="/assisted-access">Apply for Assisted Access</Link>
              </Button>
            </div>
            
            <div className="bg-background-alt p-6 rounded-lg">
              <p className="text-sm text-foreground">
                <strong>Your Privacy:</strong> Assisted Access applications are confidential. We don't share this information or use it for any other purpose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - About Alert Service */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl text-primary text-center mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-muted-foreground mb-12">About Alert Service</p>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem 
                value="item-0"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  How does Alert Service work?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  When you subscribe, you choose up to 3 Ontario cities to monitor. Whenever a doctor in those cities changes their status to "Accepting," we send you an email alert with their information. You'll receive alerts within minutes of the status change, giving you time to call before their roster fills.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-1"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  What information is included in alert emails?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Each alert includes: Doctor's name and specialty, Clinic name and full address, Phone number to call, Distance from the city center you're monitoring, and When the status was updated.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-2"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I change my monitored cities?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. You can update your monitored cities anytime through your account settings. Changes take effect immediately.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-3"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  How many alerts will I receive?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  This varies based on how many doctors are accepting patients in your monitored cities. Some weeks you might receive several alerts; other weeks, none. We only email when there's an actual opportunity.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-4"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I use alerts for multiple family members?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Absolutely. Many subscribers use their 3 city slots to help parents, children, or other family members in different cities find doctors.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* FAQ Section - Payment & Billing */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl text-primary text-center mb-8">Payment & Billing</h3>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem 
                value="item-0"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I cancel anytime?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Cancel anytime with one click. No cancellation fees, no questions asked. You'll retain access until the end of your current billing period.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-1"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  What payment methods do you accept?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. Payment is processed securely through Stripe.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-2"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Will my subscription auto-renew?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, subscriptions automatically renew monthly unless you cancel.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-3"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I get a refund?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Refunds are available within the first 7 days of your initial subscription, unless you received a doctor alert during that time. Once you receive an alert, refunds are not available. You can cancel anytime to avoid future charges.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-4"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Do you offer annual billing?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Currently we only offer monthly billing at $7.99/month. This gives you the flexibility to cancel as soon as you find a doctor.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* FAQ Section - About Free Search */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl text-primary text-center mb-8">About Free Search</h3>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem 
                value="item-0"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Is Free Search really free forever?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. No hidden fees, no trial periods, no credit card required. Searching will always be free.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-1"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Do I need to create an account to use Free Search?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Just visit the site and start searching. Accounts are only required for Alert Service and Assisted Access members.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-2"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Is there a limit to how many searches I can do?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No limits. Search as often as you like, for as many cities as you want.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* FAQ Section - About Assisted Access */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl text-primary text-center mb-8">About Assisted Access</h3>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem 
                value="item-0"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  What qualifies me for Assisted Access?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We don't set specific criteria. If $7.99/month is a financial barrier for you, you qualify. We trust you to assess your own situation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-1"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Do I need to provide proof of income?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Assisted Access is based on self-assessment. We don't ask for documentation.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-2"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  How long does Assisted Access last?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Assisted Access lasts for 6 months. At the end of your term, you can renew with a single click if you still need support. If your financial situation improves during the 6 months, we kindly ask that you consider upgrading to the paid Alert Service—paid subscribers are what make it possible for us to offer Assisted Access to those who need it.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-3"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Is Assisted Access really the same as the paid Alert Service?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Assisted Access users receive the exact same Alert Service—up to 3 cities, instant notifications, all features included.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* FAQ Section - Security & Privacy */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl text-primary text-center mb-8">Security & Privacy</h3>
            
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem 
                value="item-0"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Is my payment information secure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. We never store your credit card information on our servers. All payments are processed through Stripe, a PCI-compliant payment processor used by millions of businesses.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-1"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  What do you do with my data?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We collect only what's necessary to provide the service: For Free Search: Search location (city/postal code), anonymous usage data. For Alert Service: Email address, monitored cities, payment information (stored by Stripe). We never sell your data or share it with third parties for marketing purposes.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem 
                value="item-2"
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  Can I delete my account and data?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. If you're an Alert Service subscriber, you must cancel your subscription first, then you can request account deletion. Assisted Access users can delete their account anytime. Contact us to request deletion and we'll permanently remove your information within 30 days.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-8 text-center">
              <Link to="/privacy" className="text-secondary hover:text-primary transition-colors inline-flex items-center gap-1">
                Read Full Privacy Policy <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

{/* Still Have Questions */}
      <section className="bg-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl text-primary mb-6">
              Need More Information?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Have a question we didn't answer? Want to know if Alert Service is right for you? We're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/how-it-works">Read How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-background-alt py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-4xl text-primary mb-4">
              Ready to Get Started?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <h3 className="text-2xl text-foreground mb-3">Start with Free Search</h3>
              <p className="text-muted-foreground mb-6">
                Not sure if you need alerts? Start with free search and upgrade later if you want.
              </p>
              <Button size="lg" className="w-full" asChild>
                <Link to="/doctors">Start Searching for Free</Link>
              </Button>
            </div>
            
            <div className="bg-card p-8 rounded-xl shadow-sm border border-border text-center">
              <h3 className="text-2xl text-foreground mb-3">Subscribe to Alert Service</h3>
              <p className="text-muted-foreground mb-6">
                Ready to get notified the moment doctors start accepting?
              </p>
              <Button size="lg" className="w-full" onClick={handleSubscribe} disabled={loading || isSubscribed}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : isSubscribed ? (
                  "Already Subscribed - Go to Dashboard"
                ) : (
                  "Subscribe Now - $7.99/month"
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="bg-background py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-secondary mb-2" />
                <p className="text-sm text-muted-foreground">Secure payment via Stripe</p>
              </div>
              <div className="flex flex-col items-center">
                <CreditCard className="h-8 w-8 text-secondary mb-2" />
                <p className="text-sm text-muted-foreground">Cancel anytime, no fees</p>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-secondary mb-2" />
                <p className="text-sm text-muted-foreground">Your data is never sold</p>
              </div>
              <div className="flex flex-col items-center">
                <Check className="h-8 w-8 text-secondary mb-2" />
                <p className="text-sm text-muted-foreground">Transparent pricing</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
