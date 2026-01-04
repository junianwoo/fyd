import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  Loader2, 
  XCircle, 
  Phone, 
  Mail, 
  Globe, 
  Languages, 
  Users, 
  Accessibility, 
  Video 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DoctorData {
  id: string;
  fullName: string;
  clinicName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string | null;
  website: string | null;
  acceptingStatus: string;
  languages: string[];
  accessibilityFeatures: string[];
  ageGroupsServed: string[];
  virtualAppointments: boolean;
}

const LANGUAGE_OPTIONS = ["English", "French", "Mandarin", "Cantonese", "Punjabi", "Hindi", "Tamil", "Arabic", "Spanish", "Portuguese", "Italian", "Korean", "Vietnamese", "Tagalog", "Urdu"];
const ACCESSIBILITY_OPTIONS = ["Wheelchair Accessible", "Accessible Parking", "Elevator Access", "Accessible Washroom", "TTY/TDD Service"];
const AGE_GROUP_OPTIONS = ["Children (0-12)", "Teens (13-17)", "Adults (18-64)", "Seniors (65+)"];

export default function ClaimVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  
  // Form state
  const [acceptingStatus, setAcceptingStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<string[]>([]);
  const [ageGroupsServed, setAgeGroupsServed] = useState<string[]>([]);
  const [virtualAppointments, setVirtualAppointments] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid verification link. Please request a new one.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-claim", {
          body: { token },
        });

        if (error || data?.error) {
          throw new Error(data?.error || error?.message || "Verification failed");
        }

        const doctorData = data.doctor as DoctorData;
        setDoctor(doctorData);
        
        // Initialize form with current values
        setAcceptingStatus(doctorData.acceptingStatus);
        setPhone(doctorData.phone || "");
        setEmail(doctorData.email || "");
        setWebsite(doctorData.website || "");
        setLanguages(doctorData.languages || []);
        setAccessibilityFeatures(doctorData.accessibilityFeatures || []);
        setAgeGroupsServed(doctorData.ageGroupsServed || []);
        setVirtualAppointments(doctorData.virtualAppointments || false);
      } catch (err: any) {
        setError(err.message || "Failed to verify token");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const toggleArrayItem = (arr: string[], item: string, setter: (arr: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter(i => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-claimed-listing", {
        body: {
          token,
          updates: {
            accepting_status: acceptingStatus,
            phone,
            email: email || null,
            website: website || null,
            languages,
            accessibility_features: accessibilityFeatures,
            age_groups_served: ageGroupsServed,
            virtual_appointments: virtualAppointments,
          },
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Update failed");
      }

      toast({
        title: "Listing updated successfully!",
        description: "Your changes are now live. Thank you for keeping your listing accurate.",
      });

      // Redirect to doctor page after 2 seconds
      setTimeout(() => {
        navigate(`/doctors/${doctor?.id}`);
      }, 2000);
    } catch (err: any) {
      toast({
        title: "Error updating listing",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/doctors")}>
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <CheckCircle className="h-12 w-12 text-status-accepting mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Verify & Update Your Listing
          </h1>
          <p className="text-muted-foreground">
            Update your clinic information below. Changes go live immediately.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{doctor?.fullName}</CardTitle>
            <CardDescription>{doctor?.clinicName}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {doctor?.address}, {doctor?.city}, {doctor?.province} {doctor?.postalCode}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Accepting Status */}
            <div className="space-y-2">
              <Label>Accepting New Patients *</Label>
              <Select value={acceptingStatus} onValueChange={setAcceptingStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accepting">Yes - Accepting New Patients</SelectItem>
                  <SelectItem value="not_accepting">No - Not Accepting</SelectItem>
                  <SelectItem value="waitlist">Waitlist Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone *
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(416) 555-1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="clinic@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Website
              </Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://www.clinic.com"
              />
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
                    variant={languages.includes(lang) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(languages, lang, setLanguages)}
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
                    variant={ageGroupsServed.includes(group) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(ageGroupsServed, group, setAgeGroupsServed)}
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
                    variant={accessibilityFeatures.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(accessibilityFeatures, feature, setAccessibilityFeatures)}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Virtual Appointments */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="virtual"
                checked={virtualAppointments}
                onCheckedChange={(checked) => setVirtualAppointments(checked as boolean)}
              />
              <Label htmlFor="virtual" className="flex items-center gap-2 cursor-pointer">
                <Video className="h-4 w-4" />
                Virtual Appointments Available
              </Label>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t">
              <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save & Verify Listing
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                Your listing will display "✓ Verified by clinic" badge
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
