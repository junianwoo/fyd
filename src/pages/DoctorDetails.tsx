import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Clock, 
  Languages, 
  Users, 
  Accessibility, 
  Video, 
  CheckCircle,
  ArrowLeft,
  Flag,
  Loader2,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fetchDoctorById, submitCommunityReport, claimListing, Doctor, DoctorStatus } from "@/lib/doctors";
import { useToast } from "@/hooks/use-toast";

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState<DoctorStatus | "">("");
  const [reportDetails, setReportDetails] = useState("");
  const [claimEmail, setClaimEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const loadDoctor = async () => {
      if (!id) return;
      setLoading(true);
      const data = await fetchDoctorById(id);
      setDoctor(data);
      setLoading(false);
    };
    loadDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-foreground mb-4">Doctor Not Found</h1>
          <p className="text-muted-foreground mb-6">The doctor you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/doctors">Back to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSubmitReport = async () => {
    if (!reportStatus) {
      toast({
        title: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const result = await submitCommunityReport(doctor.id, reportStatus as DoctorStatus, reportDetails);
    setSubmitting(false);

    if (result.success) {
      toast({
        title: "Thank you for your update!",
        description: result.message,
      });
      setReportDialogOpen(false);
      setReportStatus("");
      setReportDetails("");
      
      // Reload doctor data
      const updatedDoctor = await fetchDoctorById(doctor.id);
      if (updatedDoctor) setDoctor(updatedDoctor);
    } else {
      toast({
        title: "Error submitting report",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleClaimListing = async () => {
    if (!claimEmail || !claimEmail.includes("@")) {
      toast({
        title: "Please enter a valid email",
        variant: "destructive",
      });
      return;
    }

    setClaiming(true);
    const result = await claimListing(doctor.id, claimEmail);
    setClaiming(false);

    if (result.success) {
      toast({
        title: "Verification email sent!",
        description: "Check your inbox for a link to claim this listing.",
      });
      setClaimDialogOpen(false);
      setClaimEmail("");
    } else {
      toast({
        title: "Error sending verification",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${doctor.address}, ${doctor.city}, ${doctor.province} ${doctor.postalCode}`
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/doctors" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <StatusBadge status={doctor.acceptingStatus} size="lg" className="mb-4" />
              <h1 className="text-3xl md:text-4xl text-foreground mb-2">
                {doctor.fullName}
              </h1>
              <p className="text-lg text-muted-foreground">{doctor.clinicName}</p>
            </div>
            
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Flag className="h-4 w-4 mr-2" />
                  Update This Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Doctor Status</DialogTitle>
                  <DialogDescription>
                    Help keep this listing accurate. Your update helps others find care faster.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Status</label>
                    <Select
                      value={reportStatus}
                      onValueChange={(value) => setReportStatus(value as DoctorStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accepting">Accepting Patients</SelectItem>
                        <SelectItem value="not_accepting">Not Accepting</SelectItem>
                        <SelectItem value="waitlist">Waitlist Only</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Additional Details (Optional)</label>
                    <Textarea
                      placeholder="e.g., 'Called on Jan 3, they said accepting new patients'"
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReport} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Update"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Last Verified: {formatDate(doctor.statusLastUpdatedAt)}</span>
            </div>
            <span>|</span>
            <span>
              Verified by: {doctor.statusVerifiedBy === "doctor" ? (
                <span className="text-secondary font-medium">Doctor ✓</span>
              ) : (
                "Community"
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-secondary" />
                  Contact & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    {doctor.address}<br />
                    {doctor.city}, {doctor.province} {doctor.postalCode}
                  </a>
                </div>
                
                <div className="flex flex-col gap-2">
                  <a
                    href={`tel:${doctor.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {doctor.phone}
                  </a>
                  
                  {doctor.email && (
                    <a
                      href={`mailto:${doctor.email}`}
                      className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {doctor.email}
                    </a>
                  )}
                  
                  {doctor.website && (
                    <a
                      href={doctor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Languages Spoken
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Age Groups Served
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {doctor.ageGroupsServed.map((group) => (
                      <Badge key={group} variant="outline">{group}</Badge>
                    ))}
                  </div>
                </div>

                {doctor.accessibilityFeatures.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Accessibility className="h-4 w-4" />
                      Accessibility Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {doctor.accessibilityFeatures.map((feature) => (
                        <Badge key={feature} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Services
                  </h4>
                  <div className="flex items-center gap-2">
                    {doctor.virtualAppointments ? (
                      <Badge className="bg-secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Virtual Appointments Available
                      </Badge>
                    ) : (
                      <Badge variant="outline">In-Person Only</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Community Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Community Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-background-alt rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Updated {formatDate(doctor.statusLastUpdatedAt)}
                    </p>
                    <p className="text-foreground mt-1">
                      Status: "{doctor.acceptingStatus.replace("_", " ")}"
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {doctor.communityReportCount} community reports received
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Card */}
            <Card className="bg-background-alt border-secondary/20">
              <CardContent className="p-6">
                <h3 className="text-foreground mb-2">
                  Get Alerts for This Area
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be notified when doctors near {doctor.city} start accepting patients.
                </p>
                <Button className="w-full" asChild>
                  <Link to="/pricing">See Pricing</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Doctor Claiming */}
            {!doctor.claimedByDoctor && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-foreground mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Is this your clinic?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Claim this listing to keep it accurate and verified.
                  </p>
                  <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Claim This Listing
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Claim Your Listing</DialogTitle>
                        <DialogDescription>
                          Enter your clinic email to receive a verification link. 
                          This helps us ensure only authorized staff can update listings.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="claim-email">Work Email</Label>
                          <Input
                            id="claim-email"
                            type="email"
                            placeholder="clinic@example.com"
                            value={claimEmail}
                            onChange={(e) => setClaimEmail(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            We'll send a verification link that expires in 24 hours.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleClaimListing} disabled={claiming}>
                          {claiming ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Verification Email"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
