import { useState, useEffect, useRef } from "react";
import { AdminClinicImport } from "./AdminClinicImport";
import {
  Stethoscope, 
  Search, 
  Loader2,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  Edit,
  ExternalLink,
  Save,
  X,
  Bell,
  Languages,
  Users,
  Accessibility,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

const LANGUAGE_OPTIONS = ["English", "French", "Mandarin", "Cantonese", "Punjabi", "Hindi", "Tamil", "Arabic", "Spanish", "Portuguese", "Italian", "Korean", "Vietnamese", "Tagalog", "Urdu"];
const ACCESSIBILITY_OPTIONS = ["Wheelchair Accessible", "Accessible Parking", "Elevator Access", "Accessible Washroom", "TTY/TDD Service"];
const AGE_GROUP_OPTIONS = ["Children (0-12)", "Teens (13-17)", "Adults (18-64)", "Seniors (65+)"];

type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
type AcceptingStatus = Database["public"]["Enums"]["accepting_status"];

export default function AdminClinics() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AcceptingStatus | "all">("all");
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [creatingClinic, setCreatingClinic] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Doctor>>({});
  const [saving, setSaving] = useState(false);
  const [testingAlertId, setTestingAlertId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    accepting: 0,
    notAccepting: 0,
    waitlist: 0,
    unknown: 0,
    claimed: 0,
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const loadDoctors = async () => {
    setLoading(true);
    
    // Get accurate counts for all statuses (query the full dataset, not just the limited results)
    const [
      { count: totalCount },
      { count: acceptingCount },
      { count: notAcceptingCount },
      { count: waitlistCount },
      { count: unknownCount },
      { count: claimedCount }
    ] = await Promise.all([
      supabase.from("clinics").select("*", { count: "exact", head: true }),
      supabase.from("clinics").select("*", { count: "exact", head: true }).eq("accepting_status", "accepting"),
      supabase.from("clinics").select("*", { count: "exact", head: true }).eq("accepting_status", "not_accepting"),
      supabase.from("clinics").select("*", { count: "exact", head: true }).eq("accepting_status", "waitlist"),
      supabase.from("clinics").select("*", { count: "exact", head: true }).eq("accepting_status", "unknown"),
      supabase.from("clinics").select("*", { count: "exact", head: true }).eq("claimed_by_doctor", true)
    ]);
    
    // Build query with server-side filtering (for display table only)
    let query = supabase
      .from("clinics")
      .select("*", { count: "exact" })
      .order("name", { ascending: true });
    
    // Apply search filter server-side
    if (searchQuery.trim()) {
      query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,postal_code.ilike.%${searchQuery}%`);
    }
    
    // Apply status filter server-side
    if (statusFilter !== "all") {
      query = query.eq("accepting_status", statusFilter);
    }
    
    // Limit to reasonable page size
    query = query.limit(500);
    
    const { data, error, count } = await query;

    if (!error && data) {
      setDoctors(data);
      setStats({
        total: totalCount || 0,
        accepting: acceptingCount || 0,
        notAccepting: notAcceptingCount || 0,
        waitlist: waitlistCount || 0,
        unknown: unknownCount || 0,
        claimed: claimedCount || 0,
      });
    }
    
    setLoading(false);
  };

  // Load doctors on mount and when search/filter changes (with debounce)
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      loadDoctors();
    }, 300);
    
    // Cleanup on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, statusFilter]);

  const openEditDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setCreatingClinic(false);
    setEditForm({
      name: doctor.name,
      address: doctor.address,
      city: doctor.city,
      province: doctor.province,
      postal_code: doctor.postal_code,
      phone: doctor.phone,
      email: doctor.email,
      website: doctor.website,
      accepting_status: doctor.accepting_status,
      virtual_appointments: doctor.virtual_appointments,
      languages: doctor.languages || ["English"],
      accessibility_features: doctor.accessibility_features || [],
      age_groups_served: doctor.age_groups_served || ["Adults (18-64)"],
      latitude: doctor.latitude,
      longitude: doctor.longitude,
    });
  };

  const openCreateDialog = () => {
    setCreatingClinic(true);
    setEditingDoctor(null);
    setEditForm({
      name: "",
      address: "",
      city: "",
      province: "ON",
      postal_code: "",
      phone: "",
      email: "",
      website: "",
      accepting_status: "unknown",
      virtual_appointments: false,
      languages: ["English"],
      accessibility_features: [],
      age_groups_served: ["Adults (18-64)"],
      latitude: 0,
      longitude: 0,
    });
  };

  const toggleArrayItem = (arr: string[], item: string, setter: (arr: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleSaveDoctor = async () => {
    setSaving(true);
    
    // Validate required fields
    if (!editForm.name || !editForm.address || !editForm.city || !editForm.postal_code || !editForm.phone) {
      toast.error("Please fill in all required fields");
      setSaving(false);
      return;
    }

    // Validate latitude and longitude
    if (editForm.latitude === undefined || editForm.longitude === undefined || 
        editForm.latitude === 0 || editForm.longitude === 0) {
      toast.error("Please provide valid latitude and longitude coordinates");
      setSaving(false);
      return;
    }
    
    if (creatingClinic) {
      // Create new clinic
      const { error } = await supabase
        .from("clinics")
        .insert({
          ...editForm,
          status_last_updated_at: new Date().toISOString(),
          status_verified_by: "admin" as const,
          created_at: new Date().toISOString(),
        });

      if (error) {
        toast.error("Failed to create clinic");
        console.error(error);
      } else {
        toast.success("Clinic created successfully");
        setCreatingClinic(false);
        loadDoctors();
      }
    } else if (editingDoctor) {
      // Update existing clinic
      const { error } = await supabase
        .from("clinics")
        .update({
          ...editForm,
          status_last_updated_at: new Date().toISOString(),
          status_verified_by: "admin" as const,
        })
        .eq("id", editingDoctor.id);

      if (error) {
        toast.error("Failed to update clinic");
        console.error(error);
      } else {
        toast.success("Clinic updated successfully");
        setEditingDoctor(null);
        loadDoctors();
      }
    }
    
    setSaving(false);
  };

  const handleTestAlert = async (doctorId: string) => {
    setTestingAlertId(doctorId);
    
    try {
      const { data, error } = await supabase.functions.invoke('run-alert-engine', {
        body: { doctorId }
      });
      
      if (error) {
        toast.error("Alert test failed: " + error.message);
      } else {
        toast.success(`Alert test completed! Sent ${data.alertsSent || 0} emails`);
      }
    } catch (error: any) {
      toast.error("Alert test failed: " + (error.message || "Unknown error"));
    } finally {
      setTestingAlertId(null);
    }
  };

  // Server-side filtering is now handled in loadDoctors, so filteredDoctors = doctors
  const filteredDoctors = doctors;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: AcceptingStatus) => {
    switch (status) {
      case "accepting":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepting
          </Badge>
        );
      case "not_accepting":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Not Accepting
          </Badge>
        );
      case "waitlist":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Waitlist
          </Badge>
        );
      case "unknown":
        return (
          <Badge variant="outline">
            <HelpCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <AdminClinicImport />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Accepting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-green-600">{stats.accepting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Not Accepting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-red-600">{stats.notAccepting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-yellow-600">{stats.waitlist}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Unknown</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-muted-foreground">{stats.unknown}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-blue-600">{stats.claimed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Clinics Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Clinic Management
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button onClick={openCreateDialog} size="sm" className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Create Clinic
              </Button>
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clinic name, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as AcceptingStatus | "all")}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="accepting">Accepting</SelectItem>
                  <SelectItem value="not_accepting">Not Accepting</SelectItem>
                  <SelectItem value="waitlist">Waitlist</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No clinics found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{doctor.name}</span>
                        {doctor.claimed_by_doctor && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1 text-blue-500" />
                            Claimed
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {doctor.city}, {doctor.province}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(doctor.accepting_status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground capitalize">
                        {doctor.status_verified_by || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(doctor.status_last_updated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {doctor.accepting_status === "accepting" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleTestAlert(doctor.id)}
                            disabled={testingAlertId === doctor.id}
                            title="Test alert emails"
                          >
                            {testingAlertId === doctor.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Bell className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(doctor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/clinics/${doctor.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && filteredDoctors.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {searchQuery || statusFilter !== "all" 
                ? `Showing ${filteredDoctors.length} matching clinics (of ${stats.total} total)`
                : `Showing ${filteredDoctors.length} clinics (of ${stats.total} total) - Use search to find specific clinics`
              }
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit/Create Clinic Dialog */}
      <Dialog open={!!editingDoctor || creatingClinic} onOpenChange={() => {
        setEditingDoctor(null);
        setCreatingClinic(false);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{creatingClinic ? "Create New Clinic" : "Edit Clinic"}</DialogTitle>
            <DialogDescription>
              {creatingClinic 
                ? "Add a new clinic to the database with all pertinent information."
                : "Update clinic information and accepting status."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Clinic Name *</Label>
              <Input
                id="name"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={editForm.address || ""}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={editForm.city || ""}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={editForm.province || ""}
                  onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input
                  id="postal_code"
                  value={editForm.postal_code || ""}
                  onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={editForm.latitude || ""}
                  onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 43.6532"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={editForm.longitude || ""}
                  onChange={(e) => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., -79.3832"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editForm.website || ""}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accepting_status">Accepting Status</Label>
                <Select
                  value={editForm.accepting_status}
                  onValueChange={(value) => setEditForm({ ...editForm, accepting_status: value as AcceptingStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accepting">Accepting</SelectItem>
                    <SelectItem value="not_accepting">Not Accepting</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="virtual">Virtual Appointments</Label>
                <Select
                  value={editForm.virtual_appointments ? "yes" : "no"}
                  onValueChange={(value) => setEditForm({ ...editForm, virtual_appointments: value === "yes" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Languages className="h-4 w-4" /> Languages Spoken
              </Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <Badge
                    key={lang}
                    variant={(editForm.languages || []).includes(lang) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(editForm.languages || [], lang, (arr) => setEditForm({ ...editForm, languages: arr }))}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Age Groups */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" /> Age Groups Served
              </Label>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUP_OPTIONS.map((group) => (
                  <Badge
                    key={group}
                    variant={(editForm.age_groups_served || []).includes(group) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(editForm.age_groups_served || [], group, (arr) => setEditForm({ ...editForm, age_groups_served: arr }))}
                  >
                    {group}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Accessibility */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Accessibility className="h-4 w-4" /> Accessibility Features
              </Label>
              <div className="flex flex-wrap gap-2">
                {ACCESSIBILITY_OPTIONS.map((feature) => (
                  <Badge
                    key={feature}
                    variant={(editForm.accessibility_features || []).includes(feature) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(editForm.accessibility_features || [], feature, (arr) => setEditForm({ ...editForm, accessibility_features: arr }))}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingDoctor(null);
              setCreatingClinic(false);
            }}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveDoctor} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {creatingClinic ? "Create Clinic" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
