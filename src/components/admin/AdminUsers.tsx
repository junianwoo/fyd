import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Loader2,
  Mail,
  Calendar,
  CreditCard,
  Heart,
  User as UserIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserStatus = Database["public"]["Enums"]["user_status"];

export default function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [stats, setStats] = useState({
    total: 0,
    alertService: 0,
    assistedAccess: 0,
    free: 0,
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProfiles(data);
      setStats({
        total: data.length,
        alertService: data.filter(p => p.status === "alert_service").length,
        assistedAccess: data.filter(p => p.status === "assisted_access").length,
        free: data.filter(p => p.status === "free").length,
      });
    }
    
    setLoading(false);
  };

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch = profile.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || profile.status === statusFilter;
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

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "alert_service":
        return <Badge className="bg-green-100 text-green-800">Alert Service</Badge>;
      case "assisted_access":
        return <Badge className="bg-blue-100 text-blue-800">Assisted Access</Badge>;
      case "free":
        return <Badge variant="secondary">Free</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSubscriptionStatus = (profile: Profile) => {
    if (profile.subscription_status === "active") {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    }
    if (profile.subscription_status === "cancel_at_period_end") {
      return <Badge className="bg-yellow-100 text-yellow-800">Canceling</Badge>;
    }
    return <span className="text-muted-foreground text-sm">—</span>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Alert Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-green-600">{stats.alertService}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Assisted Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-blue-600">{stats.assistedAccess}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Free
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-muted-foreground">{stats.free}</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => setStatusFilter(value as UserStatus | "all")}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="alert_service">Alert Service</SelectItem>
                  <SelectItem value="assisted_access">Assisted Access</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
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
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Assisted Reason</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{profile.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(profile.status)}</TableCell>
                    <TableCell>{getSubscriptionStatus(profile)}</TableCell>
                    <TableCell>
                      {profile.assisted_reason ? (
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                          {profile.assisted_reason}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.assisted_expires_at ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDate(profile.assisted_expires_at)}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(profile.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
