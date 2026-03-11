import { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Languages,
  MapPin,
  Shield,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { ConsultationBooking, Message, Review } from "../backend";
import { StarRating } from "../components/StarRating";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LawyerProfile() {
  const { id } = useParams({ from: "/lawyers/$id" });
  const { actor } = useActor();
  const { identity, login } = useInternetIdentity();
  const qc = useQueryClient();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const { data: lawyer, isLoading } = useQuery({
    queryKey: ["lawyer", id],
    queryFn: () => actor!.getLawyerById(Principal.fromText(id)),
    enabled: !!actor,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => actor!.getLawyerReviews(Principal.fromText(id)),
    enabled: !!actor,
  });

  const [bookingDate, setBookingDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [msgText, setMsgText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) return;
      const booking: ConsultationBooking = {
        id: crypto.randomUUID(),
        clientId: identity.getPrincipal(),
        lawyerId: Principal.fromText(id),
        scheduledDate: BigInt(new Date(bookingDate).getTime()) * 1_000_000n,
        notes: bookingNotes,
        status: "pending" as ConsultationBooking["status"],
      };
      await actor.bookConsultation(booking);
    },
    onSuccess: () => {
      toast.success("Consultation booked!");
      setBookingDate("");
      setBookingNotes("");
    },
    onError: () => toast.error("Failed to book consultation"),
  });

  const msgMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) return;
      const msg: Message = {
        id: crypto.randomUUID(),
        senderId: identity.getPrincipal(),
        receiverId: Principal.fromText(id),
        content: msgText,
        timestamp: BigInt(Date.now()) * 1_000_000n,
        read: false,
      };
      await actor.sendMessage(msg);
    },
    onSuccess: () => {
      toast.success("Message sent!");
      setMsgText("");
    },
    onError: () => toast.error("Failed to send message"),
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) return;
      const review: Review = {
        id: crypto.randomUUID(),
        clientId: identity.getPrincipal(),
        lawyerId: Principal.fromText(id),
        rating: BigInt(reviewRating),
        comment: reviewComment,
        createdAt: BigInt(Date.now()) * 1_000_000n,
      };
      await actor.submitReview(review);
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      setReviewComment("");
      qc.invalidateQueries({ queryKey: ["reviews", id] });
    },
    onError: () => toast.error("Failed to submit review"),
  });

  if (isLoading)
    return (
      <div
        className="text-center py-20 text-muted-foreground"
        data-ocid="lawyer_profile.loading_state"
      >
        Loading profile...
      </div>
    );
  if (!lawyer)
    return (
      <div
        className="text-center py-20 text-muted-foreground"
        data-ocid="lawyer_profile.error_state"
      >
        Lawyer not found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl border border-border shadow-sm p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl flex-shrink-0">
            {lawyer.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{lawyer.name}</h1>
              {lawyer.verificationStatus === "verified" && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-medium">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-primary font-semibold text-lg mb-1">
              {lawyer.specialization}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {lawyer.location}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {Number(lawyer.yearsExperience)} yrs exp
              </span>
              <span className="flex items-center gap-1">
                <Languages className="w-4 h-4" />
                {lawyer.languages.join(", ")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <StarRating rating={lawyer.averageRating} />
              <span className="text-sm text-muted-foreground">
                {Number(lawyer.totalReviews)} reviews
              </span>
              <span className="text-lg font-bold text-foreground ml-2">
                ₹{Number(lawyer.consultationFee)}/hr
              </span>
            </div>
          </div>
        </div>
        {lawyer.bio && (
          <p className="mt-4 text-muted-foreground border-t border-border pt-4">
            {lawyer.bio}
          </p>
        )}
        {lawyer.education && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4" />
            {lawyer.education}
          </div>
        )}
      </div>

      <Tabs defaultValue="book">
        <TabsList className="mb-6" data-ocid="lawyer_profile.tab">
          <TabsTrigger value="book" data-ocid="lawyer_profile.book.tab">
            Book Consultation
          </TabsTrigger>
          <TabsTrigger value="message" data-ocid="lawyer_profile.message.tab">
            Send Message
          </TabsTrigger>
          <TabsTrigger value="reviews" data-ocid="lawyer_profile.reviews.tab">
            Reviews ({reviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="book">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg mb-4">Book a Consultation</h3>
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Please login to book a consultation.
                </p>
                <Button
                  onClick={login}
                  data-ocid="lawyer_profile.book.login.button"
                >
                  Login to Book
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="text-sm font-medium mb-1 block"
                  >
                    Preferred Date &amp; Time
                  </label>
                  <input
                    id="booking-date"
                    type="datetime-local"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    data-ocid="lawyer_profile.booking_date.input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="booking-notes"
                    className="text-sm font-medium mb-1 block"
                  >
                    Notes (optional)
                  </label>
                  <textarea
                    id="booking-notes"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={3}
                    placeholder="Describe your legal issue briefly..."
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    data-ocid="lawyer_profile.booking_notes.textarea"
                  />
                </div>
                <Button
                  onClick={() => bookMutation.mutate()}
                  disabled={!bookingDate || bookMutation.isPending}
                  data-ocid="lawyer_profile.book.submit_button"
                >
                  {bookMutation.isPending ? "Booking..." : "Book Consultation"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="message">
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg mb-4">Contact Lawyer</h3>
            {!isLoggedIn ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Please login to send a message.
                </p>
                <Button
                  onClick={login}
                  data-ocid="lawyer_profile.message.login.button"
                >
                  Login to Message
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <label htmlFor="message-text" className="text-sm font-medium">
                  Your Message
                </label>
                <textarea
                  id="message-text"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  rows={5}
                  placeholder="Describe your legal matter..."
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  data-ocid="lawyer_profile.message.textarea"
                />
                <Button
                  onClick={() => msgMutation.mutate()}
                  disabled={!msgText.trim() || msgMutation.isPending}
                  data-ocid="lawyer_profile.message.submit_button"
                >
                  {msgMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="flex flex-col gap-4">
            {reviews.length === 0 && (
              <div
                className="text-center py-10 text-muted-foreground"
                data-ocid="lawyer_profile.reviews.empty_state"
              >
                No reviews yet.
              </div>
            )}
            {reviews.map((r, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: reviews list positional
                key={`review-${i}`}
                className="bg-white rounded-xl border border-border p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={Number(r.rating)} size={14} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(
                      Number(r.createdAt) / 1_000_000,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground">{r.comment}</p>
              </div>
            ))}
            {isLoggedIn && (
              <div className="bg-white rounded-xl border border-border p-5 mt-2">
                <h4 className="font-semibold mb-3">Leave a Review</h4>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      type="button"
                      key={`rate-${n}`}
                      onClick={() => setReviewRating(n)}
                      className="focus:outline-none"
                      data-ocid={`lawyer_profile.review_star.${n}`}
                    >
                      <Star
                        className={`w-6 h-6 ${n <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
                <label
                  htmlFor="review-comment"
                  className="text-sm font-medium block mb-1"
                >
                  Your Review
                </label>
                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience..."
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
                  data-ocid="lawyer_profile.review.textarea"
                />
                <Button
                  onClick={() => reviewMutation.mutate()}
                  disabled={!reviewComment.trim() || reviewMutation.isPending}
                  data-ocid="lawyer_profile.review.submit_button"
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
