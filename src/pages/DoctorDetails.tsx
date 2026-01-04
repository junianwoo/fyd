import { useState } from "react";
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
  Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { StatusBadge, DoctorStatus } from "@/components/ui/StatusBadge";
import { getDoctorById } from "@/data/mockDoctors";
import { useToast } from "@/hooks/use-toast";

export default function DoctorDetails() {
  const { id } = useParams<{ id: string }>();
  const doctor = getDoctorById(id || "");
  const { toast } = useToast();
  
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportStatus, setReportStatus] = useState<DoctorStatus | "">("");
  const [reportDetails, setReportDetails] = useState("");

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Doctor Not Found</h1>
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

  const handleSubmitReport = () => {
    if (!reportStatus) {
      toast({
        title: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thank you for your update!",
      description: "Your report has been submitted and will help keep this listing accurate.",
    });
    setReportDialogOpen(false);
    setReportStatus("");
    setReportDetails("");
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${doctor.address}, ${doctor.city}, ${doctor.province} ${doctor.postalCode}`
  )}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
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
                  <Button onClick={handleSubmitReport}>
                    Submit Update
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
                      Status changed to "{doctor.acceptingStatus.replace("_", " ")}"
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
                <h3 className="font-semibold text-foreground mb-2">
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
                  <h3 className="font-semibold text-foreground mb-2">
                    Is this your clinic?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Claim this listing to keep it accurate and verified.
                  </p>
                  <Button variant="outline" className="w-full">
                    Claim This Listing
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
