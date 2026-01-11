import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertTriangle, CheckCircle, Loader2, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminClinicImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [result, setResult] = useState<{ success: boolean; inserted: number; skipped: number; total: number; errors?: string[] } | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({ title: "Please upload a CSV file", variant: "destructive" });
      return;
    }

    // Confirm if replacing
    if (importMode === "replace") {
      const confirmed = window.confirm(
        "This will DELETE all existing clinics and replace them with the CSV data. Are you sure?"
      );
      if (!confirmed) return;
    }

    setImporting(true);
    setProgress(10);
    setResult(null);

    try {
      // Read file content
      const content = await file.text();
      setProgress(30);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("import-clinics", {
        body: { csvContent: content, clearExisting: importMode === "replace" },
      });

      setProgress(100);

      if (error) {
        throw new Error(error.message);
      }

      setResult(data);

      if (data.success) {
        toast({
          title: "Import successful!",
          description: `${data.inserted} clinics imported${data.skipped > 0 ? `, ${data.skipped} skipped (duplicates)` : ""}.`,
        });
      } else {
        toast({
          title: "Import completed with errors",
          description: `${data.inserted} of ${data.total} clinics imported.`,
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });
      setResult({ success: false, inserted: 0, skipped: 0, total: 0, errors: [errorMessage] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Clinics from CSV
        </CardTitle>
        <CardDescription>
          Upload a CSV file with clinic data. Choose append mode to add new clinics or replace mode to completely refresh the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Import Mode Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Import Mode</Label>
          <RadioGroup
            value={importMode}
            onValueChange={(value) => setImportMode(value as "append" | "replace")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="append" id="append" />
              <Label htmlFor="append" className="font-normal cursor-pointer">
                <span className="font-medium">Append</span>
                <span className="text-muted-foreground ml-1">(add new clinics, skip duplicates by name)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="replace" id="replace" />
              <Label htmlFor="replace" className="font-normal cursor-pointer">
                <span className="font-medium text-red-600">Replace</span>
                <span className="text-muted-foreground ml-1">(delete all existing, then import)</span>
              </Label>
            </div>
          </RadioGroup>
          {importMode === "replace" && (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Warning: This is destructive and cannot be undone!
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={importing}
            className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {importing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing clinics...
            </div>
            <Progress value={progress} />
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                {result.success ? "Import Complete" : "Import Completed with Errors"}
              </span>
            </div>
            <p className={`text-sm ${result.success ? "text-green-700" : "text-red-700"}`}>
              {result.inserted} clinics imported
              {result.skipped > 0 && `, ${result.skipped} skipped (duplicates)`}
              {result.total > 0 && ` out of ${result.total} in CSV`}.
            </p>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-800">Errors:</p>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {result.errors.length > 5 && (
                    <li>...and {result.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4" />
            CSV Format Requirements
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Required columns:</p>
            <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
              name, address, city, province, postal_code, phone, latitude, longitude
            </code>
            
            <p className="font-medium mt-3">Optional columns:</p>
            <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
              languages, google_place_id, google_formatted_address, source_url
            </code>
            
            <p className="mt-3 text-xs">
              <strong>Note:</strong> Duplicate detection in append mode is based on clinic name (case-insensitive).
            </p>
          </div>
          
          <a 
            href="/scripts/CSV_FORMAT_GUIDE_CLINICS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            View detailed CSV format guide
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
