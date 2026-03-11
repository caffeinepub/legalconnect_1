import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import type { LegalRequirement } from "../backend";
import { Button } from "../components/ui/button";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const CATEGORIES = [
  "Criminal Law",
  "Civil Law",
  "Family Law",
  "Corporate Law",
  "Property Law",
  "Labour Law",
  "Tax Law",
  "Intellectual Property",
];

export default function PostRequirement() {
  const { actor } = useActor();
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const [form, setForm] = useState({
    title: "",
    description: "",
    legalCategory: "",
    location: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) return;
      const req: LegalRequirement = {
        id: crypto.randomUUID(),
        clientId: identity.getPrincipal(),
        title: form.title,
        description: form.description,
        legalCategory: form.legalCategory,
        location: form.location,
        status: "open" as LegalRequirement["status"],
        createdAt: BigInt(Date.now()) * 1_000_000n,
      };
      await actor.postRequirement(req);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Requirement posted!");
    },
    onError: () => toast.error("Failed to post requirement"),
  });

  if (!isLoggedIn)
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <p className="text-muted-foreground mb-6">
          Please login to post a legal requirement.
        </p>
        <Button onClick={login} data-ocid="post_requirement.login.button">
          Login / Sign Up
        </Button>
      </div>
    );

  if (submitted)
    return (
      <div
        className="max-w-lg mx-auto px-4 py-20 text-center"
        data-ocid="post_requirement.success_state"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Requirement Posted!</h2>
        <p className="text-muted-foreground mb-6">
          Lawyers will review your requirement and reach out to you.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => setSubmitted(false)}
            variant="outline"
            data-ocid="post_requirement.post_another.button"
          >
            Post Another
          </Button>
          <Link to="/dashboard">
            <Button data-ocid="post_requirement.go_dashboard.button">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Post a Legal Requirement</h1>
      <p className="text-muted-foreground mb-8">
        Describe your legal needs and verified lawyers will connect with you.
      </p>

      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm flex flex-col gap-5">
        <div>
          <label
            htmlFor="req-title"
            className="text-sm font-medium mb-1.5 block"
          >
            Title *
          </label>
          <input
            id="req-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Need help with property dispute"
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            data-ocid="post_requirement.title.input"
          />
        </div>
        <div>
          <label
            htmlFor="req-category"
            className="text-sm font-medium mb-1.5 block"
          >
            Legal Category *
          </label>
          <select
            id="req-category"
            value={form.legalCategory}
            onChange={(e) =>
              setForm({ ...form, legalCategory: e.target.value })
            }
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            data-ocid="post_requirement.category.select"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="req-location"
            className="text-sm font-medium mb-1.5 block"
          >
            Location *
          </label>
          <input
            id="req-location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Mumbai, Delhi"
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            data-ocid="post_requirement.location.input"
          />
        </div>
        <div>
          <label
            htmlFor="req-desc"
            className="text-sm font-medium mb-1.5 block"
          >
            Description *
          </label>
          <textarea
            id="req-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={5}
            placeholder="Provide a detailed description of your legal issue..."
            className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            data-ocid="post_requirement.description.textarea"
          />
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={
            !form.title ||
            !form.legalCategory ||
            !form.location ||
            !form.description ||
            mutation.isPending
          }
          data-ocid="post_requirement.submit.button"
        >
          {mutation.isPending ? "Posting..." : "Post Requirement"}
        </Button>
      </div>
    </div>
  );
}
