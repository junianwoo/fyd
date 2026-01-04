import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export function AdminDoctorImport() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; inserted: number; total: number; errors?: string[] } | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast({ title: "Please upload a CSV file", variant: "destructive" });
      return;
    }

    setImporting(true);
    setProgress(10);
    setResult(null);

    try {
      // Read file content
      const content = await file.text();
      setProgress(30);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("import-doctors", {
        body: { csvContent: content, clearExisting: true },
      });

      setProgress(100);

      if (error) {
        throw new Error(error.message);
      }

      setResult(data);

      if (data.success) {
        toast({
          title: "Import successful!",
          description: `${data.inserted} of ${data.total} doctors imported.`,
        });
      } else {
        toast({
          title: "Import completed with errors",
          description: `${data.inserted} of ${data.total} doctors imported.`,
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
      setResult({ success: false, inserted: 0, total: 0, errors: [errorMessage] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Doctors from CSV
        </CardTitle>
        <CardDescription>
          Upload a CSV file with doctor data. This will replace all existing doctors in the database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              Importing doctors...
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
              {result.inserted} of {result.total} doctors imported successfully.
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

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Expected CSV columns:</p>
          <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
            cpso_number, full_name, member_status, languages, address, city, province, postal_code, phone, latitude, longitude, google_place_id, google_formatted_address, source_url
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
