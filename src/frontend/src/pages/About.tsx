import { Link } from "@tanstack/react-router";
import { CheckCircle, Scale, Shield, Users } from "lucide-react";
import { Button } from "../components/ui/button";

const features = [
  {
    title: "Verified Lawyers",
    desc: "Every lawyer on our platform goes through a document verification process.",
  },
  {
    title: "Two-Sided Marketplace",
    desc: "Clients post requirements and lawyers reach out -- or you can search and book directly.",
  },
  {
    title: "Transparent Fees",
    desc: "All consultation fees are displayed upfront. No hidden charges.",
  },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <Scale className="w-14 h-14 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">About LegalConnect</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          LegalConnect is a marketplace platform that bridges the gap between
          individuals seeking legal help and qualified, verified lawyers across
          India.
        </p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          Access to justice should not be a privilege. LegalConnect makes it
          simple and transparent to find the right legal professional for your
          specific needs -- whether it is a property dispute, a family matter, a
          corporate issue, or a criminal case. We are not a law firm. We are the
          platform that connects you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {features.map((s) => (
          <div
            key={s.title}
            className="bg-white border border-border rounded-xl p-6 text-center shadow-sm"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
              {s.title === "Verified Lawyers" ? (
                <Shield className="w-7 h-7" />
              ) : s.title === "Two-Sided Marketplace" ? (
                <Users className="w-7 h-7" />
              ) : (
                <CheckCircle className="w-7 h-7" />
              )}
            </div>
            <h3 className="font-semibold mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/lawyers">
          <Button size="lg" data-ocid="about.find_lawyer.button">
            Find a Lawyer
          </Button>
        </Link>
      </div>
    </div>
  );
}
