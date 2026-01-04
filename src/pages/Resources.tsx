import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const categories = [
  "All Resources",
  "How-To Guides",
  "Success Stories",
  "Healthcare News",
  "Product Updates",
];

const articles = [
  {
    id: "1",
    title: "What to Know When Searching for a Family Doctor in Ontario",
    excerpt: "A comprehensive guide to finding a family doctor, including where to look, what to ask, and how to improve your chances.",
    category: "How-To Guides",
    readTime: "5 min read",
    date: "2026-01-03",
    featured: true,
  },
  {
    id: "2",
    title: "Understanding the Ontario Doctor Shortage: Facts and Figures",
    excerpt: "Why 2.5 million Ontarians are without a family doctor, and what factors are contributing to the ongoing crisis.",
    category: "Healthcare News",
    readTime: "7 min read",
    date: "2026-01-02",
    featured: true,
  },
  {
    id: "3",
    title: "Walk-In Clinics vs Family Doctors: What's the Difference?",
    excerpt: "Understanding when to use walk-in clinics and why having a family doctor matters for your long-term health.",
    category: "How-To Guides",
    readTime: "4 min read",
    date: "2025-12-28",
    featured: false,
  },
  {
    id: "4",
    title: "Virtual Care in Ontario: Your Options Explained",
    excerpt: "A guide to virtual healthcare options available to Ontarians, including telehealth services and online doctor consultations.",
    category: "How-To Guides",
    readTime: "6 min read",
    date: "2025-12-20",
    featured: false,
  },
  {
    id: "5",
    title: "Health Care Connect: How It Works (And Why It Often Doesn't)",
    excerpt: "An honest look at Ontario's official patient referral program, including wait times and what to realistically expect.",
    category: "Healthcare News",
    readTime: "5 min read",
    date: "2025-12-15",
    featured: false,
  },
  {
    id: "6",
    title: "How Sarah Found a Doctor After 3 Years Searching",
    excerpt: "A Toronto mother's journey to finally finding a family doctor for her young family through community resources.",
    category: "Success Stories",
    readTime: "4 min read",
    date: "2025-12-10",
    featured: false,
  },
  {
    id: "7",
    title: "Introducing Assisted Access: Free Alerts for Those Who Need It",
    excerpt: "We're launching a new program to ensure financial barriers don't prevent anyone from accessing our Alert Service.",
    category: "Product Updates",
    readTime: "3 min read",
    date: "2025-12-05",
    featured: false,
  },
];

export default function Resources() {
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "All Resources" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const recentArticles = [...articles].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

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

      {/* Main Content - Two Column Layout */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
            
            {/* Left Sidebar - 30% */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-24 space-y-8">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Categories</h3>
                  <nav className="space-y-1">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Recent Resources - Desktop Only */}
                <div className="hidden lg:block">
                  <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Recent</h3>
                  <div className="space-y-3">
                    {recentArticles.map((article) => (
                      <Link
                        key={article.id}
                        to={`/resources/${article.id}`}
                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors line-clamp-2"
                      >
                        {article.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area - 70% */}
            <div className="flex-1">
              {/* Results Count */}
              <p className="text-muted-foreground mb-6">
                Showing <span className="font-semibold text-foreground">{filteredArticles.length}</span> resources
                {selectedCategory !== "All Resources" && ` in ${selectedCategory}`}
              </p>

              {/* Articles Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="secondary">{article.category}</Badge>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {article.readTime}
                        </span>
                      </div>
                      <h2 className="text-lg text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
                        <Link to={`/resources/${article.id}`}>
                          {article.title}
                        </Link>
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(article.date)}
                        </span>
                        <Link 
                          to={`/resources/${article.id}`}
                          className="inline-flex items-center text-secondary hover:text-primary transition-colors text-sm"
                        >
                          Read More <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredArticles.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">
                    No resources found matching your criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("All Resources");
                      setSearchQuery("");
                    }}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
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
