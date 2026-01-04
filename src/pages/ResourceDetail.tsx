import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchResourceBySlug, Resource } from "@/lib/resources";

export default function ResourceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadResource();
    }
  }, [slug]);

  const loadResource = async () => {
    if (!slug) return;
    setLoading(true);
    const data = await fetchResourceBySlug(slug);
    setResource(data);
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

  // Parse text to convert markdown links [text](url) and plain URLs into clickable links
  const parseLinks = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    // Match markdown links [text](url) or plain URLs
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[1] && match[2]) {
        // Markdown link: [text](url)
        parts.push(
          <a
            key={match.index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-secondary/80 underline"
          >
            {match[1]}
          </a>
        );
      } else if (match[3]) {
        // Plain URL
        parts.push(
          <a
            key={match.index}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-secondary/80 underline break-all"
          >
            {match[3]}
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-foreground mb-4">Resource Not Found</h1>
          <p className="text-muted-foreground mb-6">The resource you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/resources">Back to Resources</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link 
              to="/resources" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resources
            </Link>

            <Badge variant="secondary" className="mb-4">{resource.category}</Badge>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
              {resource.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(resource.published_at || resource.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{resource.read_time}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Excerpt */}
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {resource.excerpt}
            </p>

            {/* Main Content */}
            {resource.content && (
              <div className="prose prose-lg max-w-none">
                {resource.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="text-foreground mb-4 leading-relaxed">
                      {parseLinks(paragraph)}
                    </p>
                  )
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 p-8 bg-background-alt rounded-xl text-center">
              <h3 className="text-xl text-foreground mb-2">
                Ready to Find Your Doctor?
              </h3>
              <p className="text-muted-foreground mb-6">
                Use our free search to find family doctors accepting patients near you.
              </p>
              <Button asChild>
                <Link to="/doctors">Search Doctors</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
