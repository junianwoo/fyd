'use client'
import { useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function ClinicSubmissionForm() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: "",
    address: "",
    phone: "",
    status: "",
    additionalInfo: "",
  });

  const handleSubmit = async () => {
    if (!formData.clinicName.trim()) {
      toast({ title: "Please enter a clinic name", variant: "destructive" });
      return;
    }
    if (!formData.address.trim()) {
      toast({ title: "Please enter an address", variant: "destructive" });
      return;
    }
    if (!formData.phone.trim()) {
      toast({ title: "Please enter a phone number", variant: "destructive" });
      return;
    }
    if (!formData.status) {
      toast({ title: "Please select a status", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/send-contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "no-reply@findyourdoctor.ca",
          subject: "New Clinic Submission",
          message: `
NEW CLINIC SUBMISSION

Clinic Name: ${formData.clinicName}
Address: ${formData.address}
Phone: ${formData.phone}
Status: ${formData.status}

Additional Information:
${formData.additionalInfo || "N/A"}
          `.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit clinic information");
      }

      toast({
        title: "Submission Received!",
        description: "Thank you! We'll review and add this clinic to our listings.",
      });

      setFormData({ clinicName: "", address: "", phone: "", status: "", additionalInfo: "" });
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to submit",
        description: error.message || "Please try again or email us directly at support@findyourdoctor.ca",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-background-alt border-secondary/20">
      <CardContent className="p-4">
        <div className="flex gap-3 mb-3">
          <Building2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Missing a Clinic?
            </h3>
            <p className="text-xs text-muted-foreground">
              Help us improve our listings by sharing clinic information
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              Submit Clinic Info
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Clinic Information</DialogTitle>
              <DialogDescription>
                Know of a clinic that should be listed? Share the details and we'll add it to our directory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Clinic Name *</Label>
                <Input
                  id="clinic-name"
                  type="text"
                  placeholder="e.g., Main Street Family Health"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-address">Address *</Label>
                <Input
                  id="clinic-address"
                  type="text"
                  placeholder="123 Main St, Toronto, ON M5H 2N2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-phone">Phone Number *</Label>
                <Input
                  id="clinic-phone"
                  type="tel"
                  placeholder="(416) 555-0123"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-status">Patient Acceptance Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
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
                <Label htmlFor="additional-info">Additional Information (Optional)</Label>
                <Textarea
                  id="additional-info"
                  placeholder="Any other details about the clinic, such as website, special services, etc."
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Clinic"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
