import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ExternalBlob,
  type LawyerProfile,
  Variant_cancelled_completed_confirmed,
  type Variant_client_lawyer,
  Variant_verified_pending_rejected,
} from "../backend";
import RoleSelector from "../components/RoleSelector";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

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

export default function LawyerDashboard() {
  const { actor } = useActor();
  const { identity, login } = useInternetIdentity();
  const qc = useQueryClient();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile", identity?.getPrincipal().toString()],
    queryFn: () => actor!.getCallerUserProfile(),
    enabled: !!actor && isLoggedIn,
  });

  const setRoleMutation = useMutation({
    mutationFn: (role: Variant_client_lawyer) => actor!.setRole(role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });

  const { data: lawyerProfile } = useQuery({
    queryKey: ["lawyerProfile", identity?.getPrincipal().toString()],
    queryFn: () => actor!.getLawyerById(identity!.getPrincipal()),
    enabled: !!actor && isLoggedIn && profile?.role === "lawyer",
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["lawyerBookings", identity?.getPrincipal().toString()],
    queryFn: () => actor!.listLawyerBookings(identity!.getPrincipal()),
    enabled: !!actor && isLoggedIn && profile?.role === "lawyer",
  });

  const { data: openRequirements = [] } = useQuery({
    queryKey: ["openRequirements"],
    queryFn: () => actor!.listOpenRequirements(),
    enabled: !!actor && isLoggedIn && profile?.role === "lawyer",
  });

  const [lp, setLp] = useState<Partial<LawyerProfile>>({
    name: "",
    specialization: "",
    location: "",
    bio: "",
    education: "",
    languages: [],
    yearsExperience: 0n,
    consultationFee: 0n,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) return;
      let photo = lawyerProfile?.photo;
      let verificationDoc = lawyerProfile?.verificationDoc;
      if (photoFile) {
        const bytes = new Uint8Array(await photoFile.arrayBuffer());
        photo = ExternalBlob.fromBytes(bytes);
      }
      if (docFile) {
        const bytes = new Uint8Array(await docFile.arrayBuffer());
        verificationDoc = ExternalBlob.fromBytes(bytes);
      }
      const merged: LawyerProfile = {
        userId: identity.getPrincipal(),
        name: lp.name || lawyerProfile?.name || "",
        specialization:
          lp.specialization || lawyerProfile?.specialization || "",
        location: lp.location || lawyerProfile?.location || "",
        bio: lp.bio || lawyerProfile?.bio || "",
        education: lp.education || lawyerProfile?.education || "",
        languages: lp.languages || lawyerProfile?.languages || [],
        yearsExperience:
          lp.yearsExperience ?? lawyerProfile?.yearsExperience ?? 0n,
        consultationFee:
          lp.consultationFee ?? lawyerProfile?.consultationFee ?? 0n,
        averageRating: lawyerProfile?.averageRating || 0,
        totalReviews: lawyerProfile?.totalReviews || 0n,
        verificationStatus:
          lawyerProfile?.verificationStatus ??
          Variant_verified_pending_rejected.pending,
        photo,
        verificationDoc,
      };
      await actor.createOrUpdateLawyerProfile(merged);
    },
    onSuccess: () => {
      toast.success("Profile saved!");
      qc.invalidateQueries({ queryKey: ["lawyerProfile"] });
    },
    onError: () => toast.error("Failed to save profile"),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) =>
      actor!.updateBookingStatus(
        id,
        Variant_cancelled_completed_confirmed.confirmed,
      ),
    onSuccess: () => {
      toast.success("Booking confirmed!");
      qc.invalidateQueries({ queryKey: ["lawyerBookings"] });
    },
  });

  if (!isLoggedIn)
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <Button onClick={login} data-ocid="lawyer_dashboard.login.button">
          Login / Sign Up
        </Button>
      </div>
    );

  if (profileLoading)
    return (
      <div
        className="text-center py-20 text-muted-foreground"
        data-ocid="lawyer_dashboard.loading_state"
      >
        Loading...
      </div>
    );

  if (!profile?.role)
    return (
      <RoleSelector
        onSelect={(r) => setRoleMutation.mutate(r)}
        loading={setRoleMutation.isPending}
      />
    );

  if (profile.role === "client")
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">
          You are registered as a client.
        </p>
        <Link to="/dashboard">
          <Button data-ocid="lawyer_dashboard.go_client_dashboard.button">
            Go to Client Dashboard
          </Button>
        </Link>
      </div>
    );

  const current = lawyerProfile;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Lawyer Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {profile.name || current?.name || "Lawyer"}
      </p>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6" data-ocid="lawyer_dashboard.tab">
          <TabsTrigger value="profile" data-ocid="lawyer_dashboard.profile.tab">
            My Profile
          </TabsTrigger>
          <TabsTrigger
            value="requirements"
            data-ocid="lawyer_dashboard.requirements.tab"
          >
            Open Requirements ({openRequirements.length})
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            data-ocid="lawyer_dashboard.bookings.tab"
          >
            My Bookings ({bookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="bg-white border border-border rounded-2xl p-8">
            <h3 className="font-semibold text-lg mb-5">Edit Your Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="lp-name"
                  className="text-sm font-medium mb-1 block"
                >
                  Full Name
                </label>
                <input
                  id="lp-name"
                  defaultValue={current?.name}
                  onChange={(e) =>
                    setLp((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-ocid="lawyer_dashboard.profile.name.input"
                />
              </div>
              <div>
                <label
                  htmlFor="lp-spec"
                  className="text-sm font-medium mb-1 block"
                >
                  Specialization
                </label>
                <select
                  id="lp-spec"
                  defaultValue={current?.specialization}
                  onChange={(e) =>
                    setLp((p) => ({ ...p, specialization: e.target.value }))
                  }
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-ocid="lawyer_dashboard.profile.specialization.select"
                >
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="lp-location"
                  className="text-sm font-medium mb-1 block"
                >
                  Location
                </label>
                <input
                  id="lp-location"
                  defaultValue={current?.location}
                  onChange={(e) =>
                    setLp((p) => ({ ...p, location: e.target.value }))
                  }
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-ocid="lawyer_dashboard.profile.location.input"
                />
              </div>
              <div>
                <label
                  htmlFor="lp-exp"
                  className="text-sm font-medium mb-1 block"
                >
                  Years of Experience
                </label>
                <input
                  id="lp-exp"
                  type="number"
                  defaultValue={Number(current?.yearsExperience || 0)}
                  onChange={(e) =>
                    setLp((p) => ({
                      ...p,
                      yearsExperience: BigInt(e.target.value || 0),
                    }))
                  }
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-ocid="lawyer_dashboard.profile.experience.input"
                />
              </div>
              <div>
                <label
                  htmlFor="lp-fee"
                  className="text-sm font-medium mb-1 block"
                >
                  Consultation Fee (₹/hr)
                </label>
                <input
                  id="lp-fee"
                  type="number"
                  defaultValue={Number(current?.consultationFee || 0)}
                  onChange={(e) =>
                    setLp((p) => ({
                      ...p,
                      consultationFee: BigInt(e.target.value || 0),
                    }))
                  }
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-ocid="lawyer_dashboard.profile.fee.input"
                />
              </div>
              <div>
                <label
                  htmlFor="lp-edu"
                  className="text-sm font-medium mb-1 block"
                >
                  Education
                </label>
                <input
                  id="lp-edu"
                  defaultValue={current?.education}
                  onChange={(e) =>
                    setLp((p) => ({ ...p, education: e.target.value }))
                  }
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-ocid="lawyer_dashboard.profile.education.input"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="lp-bio"
                  className="text-sm font-medium mb-1 block"
                >
                  Bio
                </label>
                <textarea
                  id="lp-bio"
                  defaultValue={current?.bio}
                  onChange={(e) =>
                    setLp((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={3}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  data-ocid="lawyer_dashboard.profile.bio.textarea"
                />
              </div>
              <div>
                <label
                  htmlFor="lp-photo"
                  className="text-sm font-medium mb-1 block"
                >
                  Profile Photo
                </label>
                <input
                  id="lp-photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full border border-border rounded-lg px-4 py-2 text-sm"
                  data-ocid="lawyer_dashboard.profile.photo.upload_button"
                />
              </div>
              <div>
                <label
                  htmlFor="lp-doc"
                  className="text-sm font-medium mb-1 block"
                >
                  Verification Document
                </label>
                <input
                  id="lp-doc"
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full border border-border rounded-lg px-4 py-2 text-sm"
                  data-ocid="lawyer_dashboard.profile.doc.upload_button"
                />
                {current?.verificationStatus && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    Status:{" "}
                    <span
                      className={
                        current.verificationStatus === "verified"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }
                    >
                      {current.verificationStatus}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="mt-6"
              data-ocid="lawyer_dashboard.profile.save.button"
            >
              {saveMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="requirements">
          {openRequirements.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="lawyer_dashboard.requirements.empty_state"
            >
              No open requirements right now.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {openRequirements.map((r, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: requirements positional
                  key={`req-${i}`}
                  className="bg-white border border-border rounded-xl p-5"
                  data-ocid={`lawyer_dashboard.requirement.item.${i + 1}`}
                >
                  <h3 className="font-semibold">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {r.legalCategory} &bull; {r.location}
                  </p>
                  <p className="text-sm mt-2">{r.description}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="lawyer_dashboard.bookings.empty_state"
            >
              No bookings yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((b, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: bookings positional
                  key={`booking-${i}`}
                  className="bg-white border border-border rounded-xl p-5 flex items-start justify-between"
                  data-ocid={`lawyer_dashboard.booking.item.${i + 1}`}
                >
                  <div>
                    <p className="font-medium">Consultation Request</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        Number(b.scheduledDate) / 1_000_000,
                      ).toLocaleString()}
                    </p>
                    {b.notes && <p className="text-sm mt-1">{b.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status] || "bg-gray-100"}`}
                    >
                      {b.status}
                    </span>
                    {b.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => confirmMutation.mutate(b.id)}
                        data-ocid={`lawyer_dashboard.booking.confirm.${i + 1}`}
                      >
                        Confirm
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
