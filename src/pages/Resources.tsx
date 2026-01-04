import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const articles = [
  {
    id: "1",
    title: "What to Know When Searching for a Family Doctor in Ontario",
    excerpt: "A comprehensive guide to finding a family doctor, including where to look, what to ask, and how to improve your chances.",
    category: "Getting Started",
    readTime: "5 min read",
    date: "2026-01-03",
  },
  {
    id: "2",
    title: "Understanding the Ontario Doctor Shortage: Facts and Figures",
    excerpt: "Why 2.5 million Ontarians are without a family doctor, and what factors are contributing to the ongoing crisis.",
    category: "Healthcare News",
    readTime: "7 min read",
    date: "2026-01-02",
  },
  {
    id: "3",
    title: "Walk-In Clinics vs Family Doctors: What's the Difference?",
    excerpt: "Understanding when to use walk-in clinics and why having a family doctor matters for your long-term health.",
    category: "Healthcare Basics",
    readTime: "4 min read",
    date: "2025-12-28",
  },
  {
    id: "4",
    title: "Virtual Care in Ontario: Your Options Explained",
    excerpt: "A guide to virtual healthcare options available to Ontarians, including telehealth services and online doctor consultations.",
    category: "Virtual Care",
    readTime: "6 min read",
    date: "2025-12-20",
  },
  {
    id: "5",
    title: "Health Care Connect: How It Works (And Why It Often Doesn't)",
    excerpt: "An honest look at Ontario's official patient referral program, including wait times and what to realistically expect.",
    category: "Healthcare Systems",
    readTime: "5 min read",
    date: "2025-12-15",
  },
];

export default function Resources() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground mb-4">
            Resources
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Helpful articles and guides about finding healthcare in Ontario
          </p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="secondary">{article.category}</Badge>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.readTime}
                        </span>
                      </div>
                      <h2 className="text-xl text-foreground mb-2 hover:text-primary transition-colors">
                        <Link to={`/resources/${article.id}`}>
                          {article.title}
                        </Link>
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(article.date)}
                        </span>
                        <Link 
                          to={`/resources/${article.id}`}
                          className="inline-flex items-center text-secondary hover:text-primary transition-colors font-medium text-sm"
                        >
                          Read More <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background-alt py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl text-primary mb-4">
            Ready to Find Your Doctor?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Use our free search to find family doctors accepting patients near you.
          </p>
          <Link 
            to="/doctors"
            className="inline-flex items-center text-secondary hover:text-primary transition-colors font-semibold"
          >
            Start Searching <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
