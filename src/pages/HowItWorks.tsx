import { Link } from "react-router-dom";
import { Search, Users, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Search for Doctors",
    description: "Enter your city or postal code to find family doctors near you. Our directory shows real-time accepting status so you know who's taking new patients.",
    icon: Search,
  },
  {
    number: "02",
    title: "Help Keep It Updated",
    description: "Called a clinic recently? Update their status in 30 seconds. Our community-powered model means everyone helps everyone find care faster.",
    icon: Users,
  },
  {
    number: "03",
    title: "Get Email Alerts",
    description: "Stop checking manually. Subscribe to get instant email notifications when doctors in your area start accepting new patients. Monitor up to 3 locations.",
    icon: Bell,
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Finding a family doctor doesn't have to be frustrating. 
            Here's how FindYourDoctor.ca makes it easier.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className={`flex flex-col md:flex-row gap-8 items-center ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-32 h-32 rounded-2xl flex items-center justify-center ${
                    index === 2 ? "bg-accent/20" : "bg-secondary/10"
                  }`}>
                    <step.icon className={`h-16 w-16 ${
                      index === 2 ? "text-accent" : "text-secondary"
                    }`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <span className="text-5xl font-bold text-muted-foreground/20">
                    {step.number}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mt-2 mb-4">
                    {step.title}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background-alt py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Ready to Find Your Doctor?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Start searching for free, or subscribe to get email alerts 
            when doctors near you start accepting patients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/doctors">
                Start Searching
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
