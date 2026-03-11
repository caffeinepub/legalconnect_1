import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Variant_cancelled_completed_confirmed,
  type Variant_client_lawyer,
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
  open: "bg-blue-100 text-blue-700",
  assigned: "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ClientDashboard() {
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

  const { data: requirements = [] } = useQuery({
    queryKey: ["requirements", identity?.getPrincipal().toString()],
    queryFn: () => actor!.listMyRequirements(identity!.getPrincipal()),
    enabled: !!actor && isLoggedIn && profile?.role === "client",
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings", identity?.getPrincipal().toString()],
    queryFn: () => actor!.listMyBookings(identity!.getPrincipal()),
    enabled: !!actor && isLoggedIn && profile?.role === "client",
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) =>
      actor!.updateBookingStatus(
        bookingId,
        Variant_cancelled_completed_confirmed.cancelled,
      ),
    onSuccess: () => {
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  if (!isLoggedIn)
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Login Required</h2>
        <Button onClick={login} data-ocid="client_dashboard.login.button">
          Login / Sign Up
        </Button>
      </div>
    );

  if (profileLoading)
    return (
      <div
        className="text-center py-20 text-muted-foreground"
        data-ocid="client_dashboard.loading_state"
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

  if (profile.role === "lawyer")
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">
          You are registered as a Lawyer.
        </p>
        <Link to="/lawyer-dashboard">
          <Button data-ocid="client_dashboard.go_lawyer_dashboard.button">
            Go to Lawyer Dashboard
          </Button>
        </Link>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {profile.name || "Client"}
      </p>

      <Tabs defaultValue="requirements">
        <TabsList className="mb-6" data-ocid="client_dashboard.tab">
          <TabsTrigger
            value="requirements"
            data-ocid="client_dashboard.requirements.tab"
          >
            My Requirements ({requirements.length})
          </TabsTrigger>
          <TabsTrigger
            value="bookings"
            data-ocid="client_dashboard.bookings.tab"
          >
            My Bookings ({bookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requirements">
          {requirements.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="client_dashboard.requirements.empty_state"
            >
              <p className="text-muted-foreground mb-4">
                No requirements posted yet.
              </p>
              <Link to="/post-requirement">
                <Button data-ocid="client_dashboard.post_requirement.button">
                  Post a Requirement
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {requirements.map((r, i) => (
                <div
                  key={r.id}
                  className="bg-white border border-border rounded-xl p-5"
                  data-ocid={`client_dashboard.requirement.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{r.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {r.legalCategory} &bull; {r.location}
                      </p>
                      <p className="text-sm mt-2">{r.description}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[r.status] || "bg-gray-100"}`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <div
              className="text-center py-16"
              data-ocid="client_dashboard.bookings.empty_state"
            >
              <p className="text-muted-foreground mb-4">No bookings yet.</p>
              <Link to="/lawyers">
                <Button
                  variant="outline"
                  data-ocid="client_dashboard.find_lawyer.button"
                >
                  Find a Lawyer
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((b, i) => (
                <div
                  key={b.id}
                  className="bg-white border border-border rounded-xl p-5"
                  data-ocid={`client_dashboard.booking.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">Consultation with Lawyer</p>
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
                          variant="destructive"
                          onClick={() => cancelMutation.mutate(b.id)}
                          data-ocid={`client_dashboard.booking.cancel.${i + 1}`}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
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
