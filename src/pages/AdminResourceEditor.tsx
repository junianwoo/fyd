import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { 
  fetchResourceById, 
  createResource, 
  updateResource, 
  generateSlug,
  Resource,
  ResourceInsert
} from "@/lib/resources";

const categories = [
  "How-To Guides",
  "Success Stories",
  "Healthcare News",
  "Product Updates",
  "General Topics",
];

export default function AdminResourceEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAdmin();
  
  const isNew = id === "new";
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ResourceInsert>>({
    title: "",
    slug: "",
    excerpt: "", // Auto-generated from content
    content: "",
    category: "How-To Guides",
    read_time: "5 min read",
    featured: false,
    published: false,
    published_at: null,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/admin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isNew && id && isAdmin) {
      loadResource();
    }
  }, [id, isNew, isAdmin]);

  const loadResource = async () => {
    if (!id) return;
    setLoading(true);
    const data = await fetchResourceById(id);
    if (data) {
      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content || "",
        category: data.category,
        read_time: data.read_time,
        featured: data.featured,
        published: data.published,
        published_at: data.published_at,
      });
    }
    setLoading(false);
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: isNew ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isHealthcareNews = formData.category === "Healthcare News";
    
    if (!formData.title || !formData.slug) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    if (isHealthcareNews && !formData.content) {
      toast({ title: "Please enter the external article URL", variant: "destructive" });
      return;
    }
    
    if (!isHealthcareNews && !formData.content) {
      toast({ title: "Please enter the article content", variant: "destructive" });
      return;
    }

    setSaving(true);
    
    // Auto-generate excerpt from content (first 150 chars)
    const generateExcerpt = (content: string) => {
      const plainText = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/https?:\/\/[^\s]+/g, '');
      return plainText.slice(0, 150).trim() + (plainText.length > 150 ? '...' : '');
    };
    
    const excerptToSave = isHealthcareNews ? "External article" : generateExcerpt(formData.content || '');

    if (isNew) {
      const result = await createResource({
        title: formData.title!,
        slug: formData.slug!,
        excerpt: excerptToSave,
        content: formData.content || null,
        category: formData.category!,
        read_time: formData.read_time!,
        featured: formData.featured!,
        published: formData.published!,
        published_at: formData.published ? new Date().toISOString() : null,
        author_id: user?.id || null,
      });

      if (result.success) {
        toast({ title: "Resource created successfully" });
        navigate("/admin");
      } else {
        toast({ title: "Error creating resource", description: result.error, variant: "destructive" });
      }
    } else {
      const result = await updateResource(id!, {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        read_time: formData.read_time,
        featured: formData.featured,
        published: formData.published,
        published_at: formData.published && !formData.published_at ? new Date().toISOString() : formData.published_at,
      });

      if (result.success) {
        toast({ title: "Resource updated successfully" });
        navigate("/admin");
      } else {
        toast({ title: "Error updating resource", description: result.error, variant: "destructive" });
      }
    }

    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/admin" 
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
              <h1 className="text-2xl text-foreground">
                {isNew ? "New Resource" : "Edit Resource"}
              </h1>
            </div>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isNew ? "Create" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {/* Main Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter resource title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    URL: /resources/{formData.slug || "..."}
                  </p>
                </div>


                {formData.category === "Healthcare News" ? (
                  <div className="space-y-2">
                    <Label htmlFor="content">External Article URL *</Label>
                    <Input
                      id="content"
                      type="url"
                      value={formData.content || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="https://example.com/article"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Link to the original article. Users will be directed to this URL.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Full article content (supports markdown links)"
                      rows={15}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="read_time">Read Time</Label>
                    <Input
                      id="read_time"
                      value={formData.read_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))}
                      placeholder="5 min read"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-border">
                  <div>
                    <Label htmlFor="featured">Featured</Label>
                    <p className="text-sm text-muted-foreground">
                      Show this resource prominently
                    </p>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-t border-border">
                  <div>
                    <Label htmlFor="published">Published</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this resource visible to the public
                    </p>
                  </div>
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
