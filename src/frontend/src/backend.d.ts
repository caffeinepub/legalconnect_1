import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface LegalRequirement {
    id: string;
    status: Variant_closed_assigned_open;
    title: string;
    clientId: Principal;
    createdAt: Time;
    description: string;
    legalCategory: string;
    location: string;
}
export interface BlogPost {
    id: string;
    title: string;
    content: string;
    createdAt: Time;
    author: string;
    category: string;
}
export type Time = bigint;
export interface Message {
    id: string;
    content: string;
    read: boolean;
    receiverId: Principal;
    timestamp: Time;
    senderId: Principal;
}
export interface ConsultationBooking {
    id: string;
    status: Variant_cancelled_pending_completed_confirmed;
    clientId: Principal;
    requirementId?: string;
    scheduledDate: Time;
    lawyerId: Principal;
    notes: string;
}
export interface LawyerProfile {
    bio: string;
    userId: Principal;
    yearsExperience: bigint;
    name: string;
    education: string;
    languages: Array<string>;
    averageRating: number;
    specialization: string;
    photo?: ExternalBlob;
    totalReviews: bigint;
    consultationFee: bigint;
    location: string;
    verificationStatus: Variant_verified_pending_rejected;
    verificationDoc?: ExternalBlob;
}
export interface UserProfile {
    name: string;
    role: Variant_client_lawyer;
}
export interface Review {
    id: string;
    clientId: Principal;
    createdAt: Time;
    lawyerId: Principal;
    comment: string;
    rating: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_cancelled_completed_confirmed {
    cancelled = "cancelled",
    completed = "completed",
    confirmed = "confirmed"
}
export enum Variant_cancelled_pending_completed_confirmed {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum Variant_client_lawyer {
    client = "client",
    lawyer = "lawyer"
}
export enum Variant_closed_assigned {
    closed = "closed",
    assigned = "assigned"
}
export enum Variant_closed_assigned_open {
    closed = "closed",
    assigned = "assigned",
    open = "open"
}
export enum Variant_verified_pending_rejected {
    verified = "verified",
    pending = "pending",
    rejected = "rejected"
}
export enum Variant_verified_rejected {
    verified = "verified",
    rejected = "rejected"
}
export interface backendInterface {
    adminVerifyLawyer(lawyerId: Principal, status: Variant_verified_rejected): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookConsultation(booking: ConsultationBooking): Promise<void>;
    createBlogPost(post: BlogPost): Promise<void>;
    createOrUpdateLawyerProfile(profile: LawyerProfile): Promise<void>;
    filterLawyersByLocation(location: string): Promise<Array<LawyerProfile>>;
    filterLawyersBySpecialization(specialization: string): Promise<Array<LawyerProfile>>;
    getBlogPost(postId: string): Promise<BlogPost | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getConversation(user1: Principal, user2: Principal): Promise<Array<Message>>;
    getLawyerById(lawyerId: Principal): Promise<LawyerProfile | null>;
    getLawyerReviews(lawyerId: Principal): Promise<Array<Review>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listBlogPosts(): Promise<Array<BlogPost>>;
    listLawyerBookings(lawyerId: Principal): Promise<Array<ConsultationBooking>>;
    listLawyers(): Promise<Array<LawyerProfile>>;
    listMyBookings(clientId: Principal): Promise<Array<ConsultationBooking>>;
    listMyConversations(userId: Principal): Promise<Array<Message>>;
    listMyRequirements(clientId: Principal): Promise<Array<LegalRequirement>>;
    listOpenRequirements(): Promise<Array<LegalRequirement>>;
    postRequirement(requirement: LegalRequirement): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(message: Message): Promise<void>;
    setRole(role: Variant_client_lawyer): Promise<void>;
    submitReview(review: Review): Promise<void>;
    submitVerificationDoc(lawyerId: Principal, doc: ExternalBlob): Promise<void>;
    updateBookingStatus(bookingId: string, status: Variant_cancelled_completed_confirmed): Promise<void>;
    updateRequirementStatus(requirementId: string, status: Variant_closed_assigned): Promise<void>;
}
