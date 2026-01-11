import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  size?: "default" | "large";
  className?: string;
}

export function SearchBar({ size = "default", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/clinics?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/clinics");
    }
  };

  const isLarge = size === "large";

  return (
    <form 
      onSubmit={handleSearch} 
      className={`flex flex-col sm:flex-row gap-3 ${className}`}
    >
      <div className="relative flex-1">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${isLarge ? "h-5 w-5" : "h-4 w-4"}`} />
        <Input
          type="text"
          placeholder="Enter your city or postal code"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`pl-10 ${isLarge ? "h-14 text-lg" : "h-10"}`}
        />
      </div>
      <Button 
        type="submit" 
        size={isLarge ? "lg" : "default"}
        className={isLarge ? "h-14 px-8 text-lg" : ""}
      >
        Find Doctors
      </Button>
    </form>
  );
}
