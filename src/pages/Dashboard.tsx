import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Bell, 
  MapPin, 
  CreditCard, 
  Settings, 
  LogOut, 
  Loader2, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { analyzePostalCode } from "@/lib/doctors";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  assisted_reason?: string | null;
  assisted_expires_at?: string | null;
  assisted_renewed_count?: number | null;
};
type AlertSetting = Database["public"]["Tables"]["alert_settings"]["Row"];

const languages = [
  "English",
  "French",
  "Mandarin",
  "Cantonese",
  "Spanish",
  "Arabic",
  "Punjabi",
  "Tagalog",
  "Italian",
  "Portuguese",
  "Polish",
  "Korean",
  "Vietnamese",
  "Tamil",
  "Urdu",
  "Farsi",
  "Russian",
  "Ukrainian",
  "Greek",
];

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const successParam = searchParams.get("success");
  
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [alertSettings, setAlertSettings] = useState<AlertSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New alert form
  const [newCity, setNewCity] = useState("");
  const [newRadius, setNewRadius] = useState("25");
  
  // Advanced filter settings
  const [applyFilters, setApplyFilters] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [accessibleParking, setAccessibleParking] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Show success message after Stripe checkout and check subscription
  useEffect(() => {
    const checkSubscriptionAfterCheckout = async () => {
      if (successParam === "true" && user) {
        toast({
          title: "Subscription activated!",
          description: "Checking your subscription status...",
        });
        
        // Check subscription status
        const { data, error } = await supabase.functions.invoke("check-subscription");
        
        if (!error && data) {
          // Refetch profile to get updated status
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          
          setProfile(profileData);
          
          if (profileData?.status === "alert_service") {
            toast({
              title: "Success!",
              description: "Your Alert Service subscription is now active.",
            });
          }
        }
      }
    };
    
    checkSubscriptionAfterCheckout();
  }, [successParam, user, toast]);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      setProfile(profileData);
      
      // Fetch alert settings
      const { data: alertData } = await supabase
        .from("alert_settings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");
      
      setAlertSettings(alertData || []);
      
      // Load filter settings from the first alert (filters apply globally to all alerts)
      if (alertData && alertData.length > 0) {
        const firstAlert = alertData[0];
        setApplyFilters(firstAlert.apply_filters || false);
        setSelectedLanguages(firstAlert.languages || []);
        setWheelchairAccessible(firstAlert.wheelchair_accessible || false);
        setAccessibleParking(firstAlert.accessible_parking || false);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleAddAlert = async () => {
    if (!user || !newCity.trim()) {
      toast({
        title: "Please enter a city or postal code",
        variant: "destructive",
      });
      return;
    }

    if (alertSettings.length >= 3) {
      toast({
        title: "Maximum 3 locations",
        description: "Remove an existing location to add a new one.",
        variant: "destructive",
      });
      return;
    }

    // Validate postal code format if it looks like a postal code
    const postalAnalysis = analyzePostalCode(newCity.trim());
    console.log("Postal analysis for:", newCity, postalAnalysis);
    
    if (postalAnalysis.isInvalid) {
      toast({
        title: "Invalid postal code format",
        description: "Please enter a complete postal code (e.g., M1S 5B2 or M1S5B2) or a city name",
        variant: "destructive",
      });
      return;
    }
    
    if (postalAnalysis.isPostalCode && !postalAnalysis.isFull && !postalAnalysis.isPartial) {
      toast({
        title: "Invalid postal code",
        description: "Please enter a complete postal code (e.g., M1S 5B2) or a city name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Get API key from env or edge function
      let apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        const response = await supabase.functions.invoke("get-maps-key");
        if (response.error) throw response.error;
        apiKey = response.data?.apiKey;
      }

      if (!apiKey) {
        toast({
          title: "Configuration error",
          description: "Maps API key not available. Please contact support.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Geocode the location (postal code OR city name)
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(newCity.trim())},Ontario,Canada&key=${apiKey}`
      );
      const geocodeData = await geocodeResponse.json();

      if (geocodeData.status !== 'OK' || !geocodeData.results?.[0]) {
        toast({
          title: "Could not find location",
          description: "Please enter a valid postal code or city name",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;

      // Save with coordinates (works for both postal codes and city names)
      const { data, error } = await supabase
        .from("alert_settings")
        .insert({
          user_id: user.id,
          city_postal: newCity.trim(),
          radius_km: parseInt(newRadius),
          latitude: lat,
          longitude: lng,
        })
        .select()
        .single();

      setSaving(false);

      if (error) {
        toast({
          title: "Error adding location",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setAlertSettings([...alertSettings, data]);
        setNewCity("");
        setNewRadius("25");
        toast({
          title: "Location added!",
          description: `You'll receive alerts for ${newCity.trim()}.`,
        });
      }
    } catch (error) {
      setSaving(false);
      toast({
        title: "Error geocoding location",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAlert = async (id: string) => {
    const { error } = await supabase
      .from("alert_settings")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error removing location",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setAlertSettings(alertSettings.filter((a) => a.id !== id));
      toast({
        title: "Location removed",
      });
    }
  };

  const handleSaveFilters = async () => {
    if (!user) return;

    setSaving(true);
    try {
      console.log("Saving filters:", {
        applyFilters,
        selectedLanguages,
        wheelchairAccessible,
        accessibleParking,
        alertSettings: alertSettings.length
      });

      // Update all alert settings with the new filter preferences
      const updates = alertSettings.map((alert) => {
        const updateData = {
          apply_filters: applyFilters,
          languages: applyFilters && selectedLanguages.length > 0 ? selectedLanguages : null,
          wheelchair_accessible: applyFilters ? wheelchairAccessible : false,
          accessible_parking: applyFilters ? accessibleParking : false,
        };
        console.log("Updating alert:", alert.id, updateData);
        
        return supabase
          .from("alert_settings")
          .update(updateData)
          .eq("id", alert.id);
      });

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        console.error("Filter update errors:", errors);
        throw new Error(errors[0].error?.message || "Failed to update some alert settings");
      }

      // Refresh alert settings
      const { data: alertData } = await supabase
        .from("alert_settings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at");

      setAlertSettings(alertData || []);

      toast({
        title: "Filters saved!",
        description: applyFilters 
          ? "Your alerts will now only include doctors matching your preferences." 
          : "Filter preferences saved. Toggle 'Apply filters' to activate them.",
      });
    } catch (error) {
      toast({
        title: "Error saving filters",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: "alert_service_monthly" },
      });

      if (error) throw error;
      
      // Check if user already has a subscription
      if (data?.error) {
        toast({
          title: "Already subscribed",
          description: data.error,
          variant: "destructive",
        });
        if (data.redirectUrl) {
          setTimeout(() => window.location.href = data.redirectUrl, 2000);
        }
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error starting checkout",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleManageBilling = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      toast({
        title: "Error opening billing portal",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshSubscription = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;
      
      // Refetch profile
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        setProfile(profileData);
        
        toast({
          title: "Subscription status updated",
          description: profileData?.status === "alert_service" 
            ? "Your subscription is active" 
            : "No active subscription found",
        });
      }
    } catch (error) {
      toast({
        title: "Error checking subscription",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  const isSubscribed = profile?.status === "alert_service" || profile?.status === "assisted_access";
  const statusLabel = profile?.status === "alert_service" 
    ? "Alert Service" 
    : profile?.status === "assisted_access" 
    ? "Assisted Access" 
    : "Free";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Subscription Status Banner */}
        {!isSubscribed && (
          <Card className="mb-8 border-accent bg-accent/10">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-foreground">Alerts Paused</h3>
                    <p className="text-sm text-muted-foreground">
                      Subscribe to the Alert Service to receive email notifications when doctors start accepting patients.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCheckout}>
                    Subscribe - $7.99/mo
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/assisted-access">Apply for Free Access</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alert Settings
            </TabsTrigger>
            <TabsTrigger value="account">
              <Settings className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Alert Settings Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-secondary" />
                  Monitored Locations
                </CardTitle>
                <CardDescription>
                  {isSubscribed 
                    ? "Add up to 3 locations to monitor for accepting doctors."
                    : "Subscribe to monitor locations and receive email alerts."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Existing Locations */}
                {alertSettings.length > 0 ? (
                  <div className="space-y-3">
                    {alertSettings.map((alert) => (
                      <div 
                        key={alert.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-background-alt"
                      >
                        <div>
                          <p className="font-medium text-foreground">{alert.city_postal}</p>
                          <p className="text-sm text-muted-foreground">
                            Within {alert.radius_km}km
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Location</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to stop monitoring {alert.city_postal}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveAlert(alert.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    No locations added yet.
                  </p>
                )}

                {/* Add New Location */}
                {isSubscribed && alertSettings.length < 3 && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Location ({alertSettings.length}/3)
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Label htmlFor="city">City or Postal Code</Label>
                        <Input
                          id="city"
                          placeholder="e.g., Toronto or M5V 1J2"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                        />
                      </div>
                      <div className="w-full sm:w-40">
                        <Label htmlFor="radius">Radius</Label>
                        <Select value={newRadius} onValueChange={setNewRadius}>
                          <SelectTrigger id="radius">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 km</SelectItem>
                            <SelectItem value="10">10 km</SelectItem>
                            <SelectItem value="25">25 km</SelectItem>
                            <SelectItem value="50">50 km</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleAddAlert} disabled={saving}>
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!isSubscribed && alertSettings.length > 0 && (
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Your saved locations will be activated once you subscribe.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Advanced Filters Card */}
            {isSubscribed && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-secondary" />
                    Advanced Filters (Optional)
                  </CardTitle>
                  <CardDescription>
                    Refine your alerts to only receive notifications for doctors matching your preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Apply Filters Checkbox */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="apply-filters"
                        checked={applyFilters}
                        onCheckedChange={(checked) => setApplyFilters(checked === true)}
                      />
                      <label htmlFor="apply-filters" className="text-sm text-foreground cursor-pointer">
                        Apply these filters to my alerts
                      </label>
                    </div>
                    {applyFilters && (
                      <div className="ml-6 mt-2 p-2 bg-accent/10 rounded-md border border-accent/20">
                        <p className="text-sm text-muted-foreground">
                          ⚠️ Only doctors matching any of these filters will trigger alerts
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Language Filters */}
                  {applyFilters && (
                    <>
                      <div className="space-y-3 border-t pt-6">
                        <Label className="text-sm text-muted-foreground">Languages (Select up to 10)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 border rounded-md bg-background-alt">
                          {languages.map((language) => (
                            <div key={language} className="flex items-center gap-2">
                              <Checkbox
                                id={`lang-${language}`}
                                checked={selectedLanguages.includes(language)}
                                disabled={!selectedLanguages.includes(language) && selectedLanguages.length >= 10}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    if (selectedLanguages.length < 10) {
                                      setSelectedLanguages([...selectedLanguages, language]);
                                    }
                                  } else {
                                    setSelectedLanguages(selectedLanguages.filter((l) => l !== language));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`lang-${language}`}
                                className="text-sm text-foreground cursor-pointer"
                              >
                                {language}
                              </label>
                            </div>
                          ))}
                        </div>
                        {selectedLanguages.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {selectedLanguages.length}/10 languages selected
                          </p>
                        )}
                      </div>

                      {/* Accessibility Filters */}
                      <div className="space-y-3 border-t pt-6">
                        <Label className="text-sm text-muted-foreground">Accessibility</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="wheelchair"
                              checked={wheelchairAccessible}
                              onCheckedChange={(checked) => setWheelchairAccessible(checked === true)}
                            />
                            <label
                              htmlFor="wheelchair"
                              className="text-sm text-foreground cursor-pointer"
                            >
                              Wheelchair Accessible
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="parking"
                              checked={accessibleParking}
                              onCheckedChange={(checked) => setAccessibleParking(checked === true)}
                            />
                            <label
                              htmlFor="parking"
                              className="text-sm text-foreground cursor-pointer"
                            >
                              Accessible Parking
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Save Filters Button */}
                      <div className="border-t pt-6">
                        <Button onClick={handleSaveFilters} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Filters"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Plan</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={isSubscribed ? "default" : "secondary"}>
                      {statusLabel}
                    </Badge>
                    {isSubscribed && (
                      <CheckCircle className="h-4 w-4 text-status-accepting" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-secondary" />
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.status === "alert_service" ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      You're subscribed to the Alert Service at $7.99/month.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleManageBilling}>
                        Manage Billing
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={handleRefreshSubscription}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Status"}
                      </Button>
                    </div>
                  </div>
                ) : profile?.status === "assisted_access" ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      You have Assisted Access (free for 6 months).
                    </p>
                    {profile.assisted_expires_at && (
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(profile.assisted_expires_at).toLocaleDateString("en-CA", {
                          year: "numeric",
                          month: "long", 
                          day: "numeric"
                        })}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={handleCheckout}>
                        Upgrade to Paid Subscription
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={handleRefreshSubscription}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Status"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Subscribe to receive email alerts when doctors start accepting patients.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <Button onClick={handleCheckout}>
                        Subscribe - $7.99/mo
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/assisted-access">Apply for Free Access</Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={handleRefreshSubscription}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh Status"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
