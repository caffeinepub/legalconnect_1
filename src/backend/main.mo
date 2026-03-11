import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Data Model
  public type UserProfile = {
    name : Text;
    role : { #client; #lawyer };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Operations
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func setRole(role : { #client; #lawyer }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set roles");
    };
    let existingProfile = userProfiles.get(caller);
    let profile : UserProfile = switch (existingProfile) {
      case (?p) { { name = p.name; role = role } };
      case (null) { { name = ""; role = role } };
    };
    userProfiles.add(caller, profile);
  };

  // Lawyer Profile Data Model
  type LawyerProfile = {
    userId : Principal;
    name : Text;
    specialization : Text;
    location : Text;
    yearsExperience : Nat;
    consultationFee : Nat;
    bio : Text;
    languages : [Text];
    education : Text;
    photo : ?Storage.ExternalBlob;
    verificationDoc : ?Storage.ExternalBlob;
    verificationStatus : { #pending; #verified; #rejected };
    averageRating : Float;
    totalReviews : Nat;
  };

  let lawyerProfiles = Map.empty<Principal, LawyerProfile>();

  module LawyerProfile {
    public func compare(profile1 : LawyerProfile, profile2 : LawyerProfile) : Order.Order {
      Text.compare(profile1.specialization, profile2.specialization);
    };

    public func compareByLocation(profile1 : LawyerProfile, profile2 : LawyerProfile) : Order.Order {
      Text.compare(profile1.location, profile2.location);
    };
  };

  // Legal Requirement Data Model
  type LegalRequirement = {
    id : Text;
    clientId : Principal;
    title : Text;
    description : Text;
    legalCategory : Text;
    location : Text;
    status : { #open; #assigned; #closed };
    createdAt : Time.Time;
  };

  let legalRequirements = Map.empty<Text, LegalRequirement>();

  // Consultation Booking Data Model
  type ConsultationBooking = {
    id : Text;
    clientId : Principal;
    lawyerId : Principal;
    requirementId : ?Text;
    scheduledDate : Time.Time;
    status : { #pending; #confirmed; #completed; #cancelled };
    notes : Text;
  };

  let consultationBookings = Map.empty<Text, ConsultationBooking>();

  // Message Data Model
  type Message = {
    id : Text;
    senderId : Principal;
    receiverId : Principal;
    content : Text;
    timestamp : Time.Time;
    read : Bool;
  };

  let messages = Map.empty<Text, Message>();

  // Review Data Model
  type Review = {
    id : Text;
    clientId : Principal;
    lawyerId : Principal;
    rating : Nat;
    comment : Text;
    createdAt : Time.Time;
  };

  let reviews = Map.empty<Text, Review>();

  // Blog Post Data Model
  type BlogPost = {
    id : Text;
    title : Text;
    content : Text;
    author : Text;
    category : Text;
    createdAt : Time.Time;
  };

  let blogPosts = Map.empty<Text, BlogPost>();

  // Helper function to check if user has lawyer role
  func isLawyer(userId : Principal) : Bool {
    switch (userProfiles.get(userId)) {
      case (?profile) { 
        switch (profile.role) {
          case (#lawyer) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  // Helper function to check if user has client role
  func isClient(userId : Principal) : Bool {
    switch (userProfiles.get(userId)) {
      case (?profile) { 
        switch (profile.role) {
          case (#client) { true };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  // Lawyer Profile Operations

  public shared ({ caller }) func createOrUpdateLawyerProfile(profile : LawyerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Only the lawyer themselves can create/update their own profile
    if (caller != profile.userId) {
      Runtime.trap("Unauthorized: Can only create/update your own lawyer profile");
    };
    // Verify the user has lawyer role
    if (not isLawyer(caller)) {
      Runtime.trap("Unauthorized: Only lawyers can create lawyer profiles");
    };
    lawyerProfiles.add(profile.userId, profile);
  };

  public query ({ caller }) func getLawyerById(lawyerId : Principal) : async ?LawyerProfile {
    // Public information - no auth required
    lawyerProfiles.get(lawyerId);
  };

  public query ({ caller }) func listLawyers() : async [LawyerProfile] {
    // Public information - no auth required
    let values = lawyerProfiles.values();
    values.toArray().sort();
  };

  public query ({ caller }) func filterLawyersBySpecialization(specialization : Text) : async [LawyerProfile] {
    // Public information - no auth required
    let filtered = lawyerProfiles.values().toArray().filter(
      func(profile) {
        profile.specialization == specialization;
      }
    );
    filtered;
  };

  public query ({ caller }) func filterLawyersByLocation(location : Text) : async [LawyerProfile] {
    // Public information - no auth required
    let filtered = lawyerProfiles.values().toArray().filter(
      func(profile) {
        profile.location == location;
      }
    );
    filtered;
  };

  public shared ({ caller }) func submitVerificationDoc(lawyerId : Principal, doc : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Only the lawyer themselves can submit verification docs
    if (caller != lawyerId) {
      Runtime.trap("Unauthorized: Can only submit verification for your own profile");
    };
    if (not isLawyer(caller)) {
      Runtime.trap("Unauthorized: Only lawyers can submit verification documents");
    };
    let profile = switch (lawyerProfiles.get(lawyerId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Lawyer profile not found") };
    };
    let updatedProfile : LawyerProfile = {
      userId = profile.userId;
      name = profile.name;
      specialization = profile.specialization;
      location = profile.location;
      yearsExperience = profile.yearsExperience;
      consultationFee = profile.consultationFee;
      bio = profile.bio;
      languages = profile.languages;
      education = profile.education;
      photo = profile.photo;
      verificationDoc = ?doc;
      verificationStatus = #pending;
      averageRating = profile.averageRating;
      totalReviews = profile.totalReviews;
    };
    lawyerProfiles.add(lawyerId, updatedProfile);
  };

  public shared ({ caller }) func adminVerifyLawyer(lawyerId : Principal, status : { #verified; #rejected }) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let profile = switch (lawyerProfiles.get(lawyerId)) {
      case (?p) { p };
      case (null) { Runtime.trap("Lawyer profile not found") };
    };
    let updatedProfile : LawyerProfile = {
      userId = profile.userId;
      name = profile.name;
      specialization = profile.specialization;
      location = profile.location;
      yearsExperience = profile.yearsExperience;
      consultationFee = profile.consultationFee;
      bio = profile.bio;
      languages = profile.languages;
      education = profile.education;
      photo = profile.photo;
      verificationDoc = profile.verificationDoc;
      verificationStatus = status;
      averageRating = profile.averageRating;
      totalReviews = profile.totalReviews;
    };
    lawyerProfiles.add(lawyerId, updatedProfile);
  };

  // Legal Requirement Operations
  public shared ({ caller }) func postRequirement(requirement : LegalRequirement) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Only clients can post requirements
    if (not isClient(caller)) {
      Runtime.trap("Unauthorized: Only clients can post legal requirements");
    };
    // Verify the caller is the client in the requirement
    if (caller != requirement.clientId) {
      Runtime.trap("Unauthorized: Can only post requirements for yourself");
    };
    legalRequirements.add(requirement.id, requirement);
  };

  public query ({ caller }) func listMyRequirements(clientId : Principal) : async [LegalRequirement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Users can only list their own requirements
    if (caller != clientId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own requirements");
    };
    let values = legalRequirements.values();
    values.toArray().filter(
      func(req) { req.clientId == clientId }
    );
  };

  public query ({ caller }) func listOpenRequirements() : async [LegalRequirement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Only lawyers can view open requirements
    if (not isLawyer(caller)) {
      Runtime.trap("Unauthorized: Only lawyers can view open requirements");
    };
    let values = legalRequirements.values();
    values.toArray().filter(
      func(req) { req.status == #open }
    );
  };

  public shared ({ caller }) func updateRequirementStatus(requirementId : Text, status : { #assigned; #closed }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let requirement = switch (legalRequirements.get(requirementId)) {
      case (?r) { r };
      case (null) { Runtime.trap("Requirement not found") };
    };
    // Only the client who created the requirement can update its status
    if (caller != requirement.clientId) {
      Runtime.trap("Unauthorized: Can only update your own requirements");
    };
    let updatedRequirement : LegalRequirement = {
      id = requirement.id;
      clientId = requirement.clientId;
      title = requirement.title;
      description = requirement.description;
      legalCategory = requirement.legalCategory;
      location = requirement.location;
      status;
      createdAt = requirement.createdAt;
    };
    legalRequirements.add(requirementId, updatedRequirement);
  };

  // Consultation Booking Operations
  public shared ({ caller }) func bookConsultation(booking : ConsultationBooking) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Only clients can book consultations
    if (not isClient(caller)) {
      Runtime.trap("Unauthorized: Only clients can book consultations");
    };
    // Verify the caller is the client in the booking
    if (caller != booking.clientId) {
      Runtime.trap("Unauthorized: Can only book consultations for yourself");
    };
    consultationBookings.add(booking.id, booking);
  };

  public query ({ caller }) func listMyBookings(clientId : Principal) : async [ConsultationBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Users can only list their own bookings
    if (caller != clientId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };
    let values = consultationBookings.values();
    values.toArray().filter(
      func(book) { book.clientId == clientId }
    );
  };

  public query ({ caller }) func listLawyerBookings(lawyerId : Principal) : async [ConsultationBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Only the lawyer themselves can view their bookings
    if (caller != lawyerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own bookings");
    };
    if (not isLawyer(lawyerId)) {
      Runtime.trap("Unauthorized: Only lawyers can view lawyer bookings");
    };
    let values = consultationBookings.values();
    values.toArray().filter(
      func(book) { book.lawyerId == lawyerId }
    );
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Text, status : { #confirmed; #completed; #cancelled }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    let booking = switch (consultationBookings.get(bookingId)) {
      case (?b) { b };
      case (null) { Runtime.trap("Booking not found") };
    };
    // Only the client or lawyer involved in the booking can update its status
    if (caller != booking.clientId and caller != booking.lawyerId) {
      Runtime.trap("Unauthorized: Can only update bookings you are involved in");
    };
    let updatedBooking : ConsultationBooking = {
      id = booking.id;
      clientId = booking.clientId;
      lawyerId = booking.lawyerId;
      requirementId = booking.requirementId;
      scheduledDate = booking.scheduledDate;
      status;
      notes = booking.notes;
    };
    consultationBookings.add(bookingId, updatedBooking);
  };

  // Message Operations
  public shared ({ caller }) func sendMessage(message : Message) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Verify the caller is the sender
    if (caller != message.senderId) {
      Runtime.trap("Unauthorized: Can only send messages as yourself");
    };
    messages.add(message.id, message);
  };

  public query ({ caller }) func getConversation(user1 : Principal, user2 : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Users can only view conversations they are part of
    if (caller != user1 and caller != user2 and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own conversations");
    };
    let values = messages.values();
    values.toArray().filter(
      func(msg) {
        (msg.senderId == user1 and msg.receiverId == user2) or
        (msg.senderId == user2 and msg.receiverId == user1)
      }
    );
  };

  public query ({ caller }) func listMyConversations(userId : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Users can only list their own conversations
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own conversations");
    };
    let values = messages.values();
    values.toArray().filter(
      func(msg) { msg.senderId == userId or msg.receiverId == userId }
    );
  };

  // Review Operations
  public shared ({ caller }) func submitReview(review : Review) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    // Only clients can submit reviews
    if (not isClient(caller)) {
      Runtime.trap("Unauthorized: Only clients can submit reviews");
    };
    // Verify the caller is the client in the review
    if (caller != review.clientId) {
      Runtime.trap("Unauthorized: Can only submit reviews as yourself");
    };
    // Validate rating is between 1 and 5
    if (review.rating < 1 or review.rating > 5) {
      Runtime.trap("Invalid rating: Must be between 1 and 5");
    };
    reviews.add(review.id, review);
  };

  public query ({ caller }) func getLawyerReviews(lawyerId : Principal) : async [Review] {
    // Public information - no auth required
    let values = reviews.values();
    values.toArray().filter(
      func(rev) { rev.lawyerId == lawyerId }
    );
  };

  // Blog Post Operations
  public shared ({ caller }) func createBlogPost(post : BlogPost) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    blogPosts.add(post.id, post);
  };

  public query ({ caller }) func listBlogPosts() : async [BlogPost] {
    // Public information - no auth required
    blogPosts.values().toArray();
  };

  public query ({ caller }) func getBlogPost(postId : Text) : async ?BlogPost {
    // Public information - no auth required
    blogPosts.get(postId);
  };
};
