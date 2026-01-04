import { useState, useEffect } from "react";
import { AdminDoctorImport } from "./AdminDoctorImport";
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
  X
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

type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
type AcceptingStatus = Database["public"]["Enums"]["accepting_status"];

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AcceptingStatus | "all">("all");
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editForm, setEditForm] = useState<Partial<Doctor>>({});
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    accepting: 0,
    notAccepting: 0,
    waitlist: 0,
    unknown: 0,
    claimed: 0,
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    
    // Get total count first
    const { count: totalCount } = await supabase
      .from("doctors")
      .select("*", { count: "exact", head: true });
    
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("full_name", { ascending: true })
      .limit(100);

    if (!error && data) {
      setDoctors(data);
      setStats({
        total: totalCount || data.length,
        accepting: data.filter(d => d.accepting_status === "accepting").length,
        notAccepting: data.filter(d => d.accepting_status === "not_accepting").length,
        waitlist: data.filter(d => d.accepting_status === "waitlist").length,
        unknown: data.filter(d => d.accepting_status === "unknown").length,
        claimed: data.filter(d => d.claimed_by_doctor).length,
      });
    }
    
    setLoading(false);
  };

  const openEditDialog = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setEditForm({
      full_name: doctor.full_name,
      clinic_name: doctor.clinic_name,
      address: doctor.address,
      city: doctor.city,
      province: doctor.province,
      postal_code: doctor.postal_code,
      phone: doctor.phone,
      email: doctor.email,
      website: doctor.website,
      accepting_status: doctor.accepting_status,
      virtual_appointments: doctor.virtual_appointments,
    });
  };

  const handleSaveDoctor = async () => {
    if (!editingDoctor) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from("doctors")
      .update({
        ...editForm,
        status_last_updated_at: new Date().toISOString(),
        status_verified_by: "doctor" as const,
      })
      .eq("id", editingDoctor.id);

    if (error) {
      toast.error("Failed to update doctor");
      console.error(error);
    } else {
      toast.success("Doctor updated successfully");
      setEditingDoctor(null);
      loadDoctors();
    }
    
    setSaving(false);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = 
      doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || doctor.accepting_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <AdminDoctorImport />

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

      {/* Doctors Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Doctor/Clinic Management
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, clinic, city..."
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
              <p className="text-muted-foreground">No doctors found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor / Clinic</TableHead>
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
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{doctor.full_name}</span>
                          {doctor.claimed_by_doctor && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1 text-blue-500" />
                              Claimed
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{doctor.clinic_name}</span>
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(doctor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/doctors/${doctor.id}`} target="_blank">
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
              Showing {filteredDoctors.length} of {stats.total} doctors (limited to 100)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Doctor Dialog */}
      <Dialog open={!!editingDoctor} onOpenChange={() => setEditingDoctor(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor / Clinic</DialogTitle>
            <DialogDescription>
              Update doctor information and accepting status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Doctor Name</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name || ""}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input
                  id="clinic_name"
                  value={editForm.clinic_name || ""}
                  onChange={(e) => setEditForm({ ...editForm, clinic_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editForm.address || ""}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editForm.city || ""}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
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
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={editForm.postal_code || ""}
                  onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDoctor(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveDoctor} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
