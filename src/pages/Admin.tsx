import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Star,
  StarOff,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchResources, deleteResource, updateResource, Resource } from "@/lib/resources";

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResources: 0,
    publishedResources: 0,
    draftResources: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/admin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadResources();
    }
  }, [isAdmin]);

  const loadResources = async () => {
    setLoading(true);
    const data = await fetchResources(true);
    setResources(data);
    setStats({
      totalResources: data.length,
      publishedResources: data.filter(r => r.published).length,
      draftResources: data.filter(r => !r.published).length,
    });
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDelete = async (id: string) => {
    const result = await deleteResource(id);
    if (result.success) {
      toast({ title: "Resource deleted successfully" });
      loadResources();
    } else {
      toast({ title: "Error deleting resource", description: result.error, variant: "destructive" });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const result = await updateResource(id, { 
      published: !currentStatus,
      published_at: !currentStatus ? new Date().toISOString() : null
    });
    if (result.success) {
      toast({ title: currentStatus ? "Resource unpublished" : "Resource published" });
      loadResources();
    } else {
      toast({ title: "Error updating resource", variant: "destructive" });
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    const result = await updateResource(id, { featured: !currentStatus });
    if (result.success) {
      toast({ title: currentStatus ? "Removed from featured" : "Added to featured" });
      loadResources();
    } else {
      toast({ title: "Error updating resource", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have admin privileges to access this page.
            </p>
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your content and settings</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-foreground">{stats.totalResources}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-green-600">{stats.publishedResources}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl text-muted-foreground">{stats.draftResources}</p>
            </CardContent>
          </Card>
        </div>

        {/* Resources Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resources
              </CardTitle>
              <Button asChild>
                <Link to="/admin/resources/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Resource
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-secondary" />
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No resources yet</p>
                <Button asChild>
                  <Link to="/admin/resources/new">Create your first resource</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {resource.featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          <span className="font-medium">{resource.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{resource.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={resource.published ? "default" : "outline"}>
                          {resource.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(resource.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFeatured(resource.id, resource.featured)}
                            title={resource.featured ? "Remove from featured" : "Add to featured"}
                          >
                            {resource.featured ? (
                              <StarOff className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTogglePublish(resource.id, resource.published)}
                            title={resource.published ? "Unpublish" : "Publish"}
                          >
                            {resource.published ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/resources/${resource.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{resource.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(resource.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
