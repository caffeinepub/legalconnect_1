import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Search, Shield, Users } from "lucide-react";
import { useState } from "react";
import type { LawyerProfile } from "../backend";
import { StarRating } from "../components/StarRating";
import { Button } from "../components/ui/button";
import { useActor } from "../hooks/useActor";

const LEGAL_CATEGORIES = [
  "Criminal Law",
  "Civil Law",
  "Family Law",
  "Corporate Law",
  "Property Law",
  "Labour Law",
  "Tax Law",
  "Intellectual Property",
];

const HOW_IT_WORKS = [
  {
    title: "Search",
    desc: "Browse verified lawyers by specialization and location.",
  },
  {
    title: "Connect",
    desc: "View profiles, compare fees, and send inquiries.",
  },
  { title: "Book", desc: "Schedule a consultation with confidence." },
];

function LawyerCard({ lawyer }: { lawyer: LawyerProfile }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
          {lawyer.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {lawyer.name}
            </h3>
            {lawyer.verificationStatus === "verified" && (
              <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {lawyer.specialization}
          </p>
          <p className="text-xs text-muted-foreground">{lawyer.location}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StarRating rating={lawyer.averageRating} size={14} />
          <span className="text-xs text-muted-foreground">
            ({Number(lawyer.totalReviews)})
          </span>
        </div>
        <span className="text-sm font-semibold text-primary">
          ₹{Number(lawyer.consultationFee)}/hr
        </span>
      </div>
      <Link to="/lawyers/$id" params={{ id: lawyer.userId.toString() }}>
        <Button
          size="sm"
          className="w-full"
          data-ocid="home.lawyer_card.button"
        >
          View Profile
        </Button>
      </Link>
    </div>
  );
}

export default function Home() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const { actor } = useActor();

  const { data: lawyers = [] } = useQuery({
    queryKey: ["lawyers"],
    queryFn: () => actor!.listLawyers(),
    enabled: !!actor,
  });

  const featured = lawyers.slice(0, 6);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    window.location.href = `/lawyers?${params.toString()}`;
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[oklch(0.22_0.1_255)] to-[oklch(0.35_0.13_255)] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find the Right Lawyer for Your Legal Needs
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            Connect with verified lawyers across India. Post your requirement,
            compare profiles, and book consultations.
          </p>
          <div className="bg-white rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-3">
            <label htmlFor="home-category" className="sr-only">
              Legal Category
            </label>
            <select
              id="home-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              data-ocid="home.category.select"
            >
              <option value="">Select Legal Category</option>
              {LEGAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label htmlFor="home-location" className="sr-only">
              Location
            </label>
            <input
              id="home-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city or location"
              className="flex-1 border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              data-ocid="home.location.input"
            />
            <Button
              onClick={handleSearch}
              className="px-8 py-3 text-sm"
              data-ocid="home.search.button"
            >
              <Search className="w-4 h-4 mr-2" /> Search Lawyers
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-xl p-6 shadow-sm text-center border border-border"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                  {s.title === "Search" ? (
                    <Search className="w-7 h-7" />
                  ) : s.title === "Connect" ? (
                    <Users className="w-7 h-7" />
                  ) : (
                    <Shield className="w-7 h-7" />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Lawyers */}
      {featured.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured Lawyers</h2>
              <Link to="/lawyers">
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="home.view_all_lawyers.button"
                >
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((l) => (
                <LawyerCard key={l.userId.toString()} lawyer={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Have a Legal Problem?</h2>
          <p className="opacity-80 mb-8">
            Post your requirement and let lawyers reach out to you.
          </p>
          <Link to="/post-requirement">
            <Button
              variant="secondary"
              size="lg"
              data-ocid="home.post_requirement.button"
            >
              Post a Legal Requirement <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
