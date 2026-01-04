import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchResources, Resource } from "@/lib/resources";

const categories = [
  "All Resources",
  "How-To Guides",
  "Success Stories",
  "Healthcare News",
  "Product Updates",
  "General Topics",
];

export default function Resources() {
  const [selectedCategory, setSelectedCategory] = useState("All Resources");
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    const data = await fetchResources(false); // Only fetch published resources
    setResources(data);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === "All Resources" || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const recentResources = [...resources].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
                {recentResources.length > 0 && (
                  <div className="hidden lg:block">
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Recent</h3>
                    <div className="space-y-3">
                      {recentResources.map((resource) => (
                        <Link
                          key={resource.id}
                          to={`/resources/${resource.slug}`}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors line-clamp-2"
                        >
                          {resource.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content Area - 70% */}
            <div className="flex-1">
              {/* Results Count */}
              <p className="text-muted-foreground mb-6">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading resources...
                  </span>
                ) : (
                  <>
                    Showing <span className="font-semibold text-foreground">{filteredResources.length}</span> resources
                    {selectedCategory !== "All Resources" && ` in ${selectedCategory}`}
                  </>
                )}
              </p>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground mb-4">
                    {resources.length === 0 
                      ? "No resources available yet. Check back soon!"
                      : "No resources found matching your criteria."
                    }
                  </p>
                  {resources.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCategory("All Resources");
                        setSearchQuery("");
                      }}
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary">{resource.category}</Badge>
                          <span className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {resource.read_time}
                          </span>
                        </div>
                        <h2 className="text-lg text-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
                          <Link to={`/resources/${resource.slug}`}>
                            {resource.title}
                          </Link>
                        </h2>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {resource.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(resource.published_at || resource.created_at)}
                          </span>
                          <Link 
                            to={`/resources/${resource.slug}`}
                            className="inline-flex items-center text-secondary hover:text-primary transition-colors text-sm"
                          >
                            Read More <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
