import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Eye,
  Users,
  Trash2,
  Check,
  RotateCcw
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type PendingUpdate = Database["public"]["Tables"]["pending_updates"]["Row"];
type CommunityReport = Database["public"]["Tables"]["community_reports"]["Row"];
type AcceptingStatus = Database["public"]["Enums"]["accepting_status"];

interface PendingUpdateWithDoctor extends PendingUpdate {
  doctors?: {
    full_name: string;
    clinic_name: string;
    city: string;
    accepting_status: AcceptingStatus;
  };
}

interface CommunityReportWithDoctor extends CommunityReport {
  doctors?: {
    full_name: string;
    clinic_name: string;
    city: string;
  };
}

export default function AdminModeration() {
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdateWithDoctor[]>([]);
  const [recentReports, setRecentReports] = useState<CommunityReportWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load pending updates
    const { data: pending } = await supabase
      .from("pending_updates")
      .select(`
        *,
        doctors (
          full_name,
          clinic_name,
          city,
          accepting_status
        )
      `)
      .order("updated_at", { ascending: false })
      .limit(50);

    if (pending) {
      setPendingUpdates(pending as PendingUpdateWithDoctor[]);
    }

    // Load recent community reports
    const { data: reports } = await supabase
      .from("community_reports")
      .select(`
        *,
        doctors (
          full_name,
          clinic_name,
          city
        )
      `)
      .order("reported_at", { ascending: false })
      .limit(50);

    if (reports) {
      setRecentReports(reports as CommunityReportWithDoctor[]);
    }
    
    setLoading(false);
  };

  const handleApproveUpdate = async (update: PendingUpdateWithDoctor) => {
    setActionLoading(update.id);
    
    // Update the doctor's status
    const { error: updateError } = await supabase
      .from("doctors")
      .update({
        accepting_status: update.status,
        status_last_updated_at: new Date().toISOString(),
        status_verified_by: "community" as const,
        community_report_count: update.count,
      })
      .eq("id", update.doctor_id);

    if (updateError) {
      toast.error("Failed to approve update");
      setActionLoading(null);
      return;
    }

    // Delete the pending update
    await supabase.from("pending_updates").delete().eq("id", update.id);
    
    toast.success("Update approved and applied");
    setActionLoading(null);
    loadData();
  };

  const handleDismissUpdate = async (updateId: string) => {
    setActionLoading(updateId);
    
    const { error } = await supabase
      .from("pending_updates")
      .delete()
      .eq("id", updateId);

    if (error) {
      toast.error("Failed to dismiss update");
    } else {
      toast.success("Pending update dismissed");
      loadData();
    }
    
    setActionLoading(null);
  };

  const handleDeleteReport = async () => {
    if (!deleteReportId) return;
    
    setActionLoading(deleteReportId);
    
    const { error } = await supabase
      .from("community_reports")
      .delete()
      .eq("id", deleteReportId);

    if (error) {
      toast.error("Failed to delete report");
    } else {
      toast.success("Report deleted");
      loadData();
    }
    
    setActionLoading(null);
    setDeleteReportId(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pending Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-foreground">{pendingUpdates.length}</p>
            <p className="text-sm text-muted-foreground">Awaiting threshold (2 reports)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recent Community Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-foreground">{recentReports.length}</p>
            <p className="text-sm text-muted-foreground">Last 50 reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pending Status Updates
          </CardTitle>
          <CardDescription>
            Community reports awaiting the 2-report threshold for auto-approval.
            Approve to apply immediately or dismiss to discard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            </div>
          ) : pendingUpdates.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No pending updates - all caught up!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor / Clinic</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead>Reported Status</TableHead>
                  <TableHead>Report Count</TableHead>
                  <TableHead>Last Report</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUpdates.map((update) => (
                  <TableRow key={update.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">
                          {update.doctors?.full_name || "Unknown"}
                        </span>
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {update.doctors?.clinic_name} — {update.doctors?.city}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {update.doctors?.accepting_status && 
                        getStatusBadge(update.doctors.accepting_status)}
                    </TableCell>
                    <TableCell>{getStatusBadge(update.status)}</TableCell>
                    <TableCell>
                      <Badge variant={update.count >= 2 ? "default" : "outline"}>
                        {update.count}/2
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(update.updated_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleApproveUpdate(update)}
                          disabled={actionLoading === update.id}
                          title="Approve and apply"
                        >
                          {actionLoading === update.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDismissUpdate(update.id)}
                          disabled={actionLoading === update.id}
                          title="Dismiss"
                        >
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/doctors/${update.doctor_id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Community Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Community Reports
          </CardTitle>
          <CardDescription>
            All recent status reports submitted by the community. Delete suspicious or spam reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-secondary" />
            </div>
          ) : recentReports.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No community reports yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor / Clinic</TableHead>
                  <TableHead>Reported Status</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Reported At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">
                          {report.doctors?.full_name || "Unknown"}
                        </span>
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {report.doctors?.clinic_name} — {report.doctors?.city}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.reported_status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                        {report.details || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(report.reported_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDeleteReportId(report.id)}
                          title="Delete report"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/doctors/${report.doctor_id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteReportId} onOpenChange={() => setDeleteReportId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Community Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this community report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
