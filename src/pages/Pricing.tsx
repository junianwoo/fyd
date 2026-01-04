import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Search, Bell, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const freeFeatures = [
  "Browse all doctors",
  "See accepting status",
  "Contact information",
  "Community updates",
];

const alertFeatures = [
  "Everything in Free",
  "Email alerts for 3 cities",
  "Advanced filters (languages, accessibility)",
  "Multi-location monitoring",
];

const faqs = [
  {
    question: "How does the Alert Service work?",
    answer: "Once subscribed, you can set up to 3 locations to monitor. Whenever a doctor in your selected areas updates their status to 'accepting patients', you'll receive an email notification immediately. This way, you can be one of the first to call.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time from your dashboard. You'll continue to have access until the end of your current billing period. No questions asked.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe. Your payment information is never stored on our servers.",
  },
  {
    question: "Is my information secure?",
    answer: "Absolutely. We use industry-standard encryption to protect your data. We never sell or share your personal information with third parties. Your email is only used for alerts and important service updates.",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      // Redirect to signup first
      navigate("/auth?mode=signup");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {},
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error starting checkout",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground mb-4">
            Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, Transparent Access to Family Doctors
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                
                <ul className="space-y-3">
                  {freeFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-status-accepting flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

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
                <p className="text-muted-foreground">Get notified when doctors accept</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-4xl font-bold text-foreground">
                  $7.99
                  <span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
                
                <ul className="space-y-3">
                  {alertFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-status-accepting flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" size="lg" onClick={handleSubscribe} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Subscribe to Alert Service"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Assisted Access Link */}
          <div className="text-center mt-8">
            <Link 
              to="/assisted-access"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              Can't afford $7.99/month? Apply for Assisted Access
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-background-alt py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl text-primary text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  );
}
