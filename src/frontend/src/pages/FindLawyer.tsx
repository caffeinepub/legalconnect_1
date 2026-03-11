import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MapPin, Shield, Star as StarIcon } from "lucide-react";
import { useState } from "react";
import type { LawyerProfile } from "../backend";
import { StarRating } from "../components/StarRating";
import { Button } from "../components/ui/button";
import { useActor } from "../hooks/useActor";

const CATEGORIES = [
  "",
  "Criminal Law",
  "Civil Law",
  "Family Law",
  "Corporate Law",
  "Property Law",
  "Labour Law",
  "Tax Law",
  "Intellectual Property",
];

function Card({ lawyer }: { lawyer: LawyerProfile }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
          {lawyer.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{lawyer.name}</h3>
            {lawyer.verificationStatus === "verified" && (
              <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-primary font-medium text-sm mb-1">
            {lawyer.specialization}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            {lawyer.location}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarRating rating={lawyer.averageRating} size={14} />
              <span className="text-xs text-muted-foreground">
                {Number(lawyer.totalReviews)} reviews
              </span>
            </div>
            <span className="text-sm font-bold text-foreground">
              ₹{Number(lawyer.consultationFee)}/hr
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {Number(lawyer.yearsExperience)} yrs experience
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Link to="/lawyers/$id" params={{ id: lawyer.userId.toString() }}>
          <Button
            size="sm"
            className="w-full"
            data-ocid="find_lawyer.view_profile.button"
          >
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function FindLawyer() {
  const { actor } = useActor();
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const { data: lawyers = [], isLoading } = useQuery({
    queryKey: ["lawyers", category, location],
    queryFn: async () => {
      if (!actor) return [];
      if (category) return actor.filterLawyersBySpecialization(category);
      if (location) return actor.filterLawyersByLocation(location);
      return actor.listLawyers();
    },
    enabled: !!actor,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find a Lawyer</h1>
        <p className="text-muted-foreground">
          Browse verified lawyers across India.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-3">
        <label htmlFor="fl-category" className="sr-only">
          Category
        </label>
        <select
          id="fl-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1"
          data-ocid="find_lawyer.category.select"
        >
          {CATEGORIES.map((c) => (
            <option key={c || "all"} value={c}>
              {c || "All Categories"}
            </option>
          ))}
        </select>
        <label htmlFor="fl-location" className="sr-only">
          Location
        </label>
        <input
          id="fl-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Filter by city..."
          className="border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1"
          data-ocid="find_lawyer.location.input"
        />
        <Button
          onClick={() => {
            setCategory("");
            setLocation("");
          }}
          variant="outline"
          data-ocid="find_lawyer.clear.button"
        >
          Clear
        </Button>
      </div>

      {isLoading ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="find_lawyer.loading_state"
        >
          Loading lawyers...
        </div>
      ) : lawyers.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="find_lawyer.empty_state"
        >
          <StarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No lawyers found. Try different filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.map((l) => (
            <Card key={l.userId.toString()} lawyer={l} />
          ))}
        </div>
      )}
    </div>
  );
}
