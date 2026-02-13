import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Data type definitions
  public type Room = Text;
  public type PdfBinary = Blob;
  public type UploadResult = { #success : Text; #error : Text };
  public type DropboxToken = Text; // Store as text - will be Base64 encoded when sent to Dropbox API

  public type PdfMetadata = { uploadTimestamp : Nat64 };
  public type MetadataAndPdf = {
    metadata : PdfMetadata;
    pdf : PdfBinary;
  };
  public type PdfEntry = {
    room : Room;
    metadata : PdfMetadata;
    pdf : PdfBinary;
  };

  public type UserProfile = {
    name : Text;
  };

  module PdfEntry {
    public func compareByRoom(a : PdfEntry, b : PdfEntry) : Order.Order {
      Text.compare(a.room, b.room);
    };
  };

  // Storage
  let pdfs = Map.empty<Room, MetadataAndPdf>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var dropboxToken : ?DropboxToken = null;

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Dropbox token management
  public shared ({ caller }) func setDropboxToken(token : DropboxToken) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can set the Dropbox token");
    };
    dropboxToken := ?token;
  };

  public query ({ caller }) func getDropboxToken() : async ?DropboxToken {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admin can view the Dropbox token");
    };
    dropboxToken;
  };

  // PDF upload (backend-only)
  public shared ({ caller }) func uploadPdf(_room : Room, _pdf : PdfBinary, _timestamp : Nat64) : async UploadResult {
    Runtime.trap("Upload should be frontend only. Backend upload not implemented.");
  };

  // Public query PDFs - require at least user access
  public query ({ caller }) func getPdf(room : Room) : async MetadataAndPdf {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view PDFs");
    };
    switch (pdfs.get(room)) {
      case (null) { Runtime.trap("PDF not found. ") };
      case (?metaAndPdf) { metaAndPdf };
    };
  };

  public query ({ caller }) func getAllSortedByRoom() : async [PdfEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view PDFs");
    };
    pdfs.toArray().map(func((room, pdfData)) { {
      room;
      pdf = pdfData.pdf;
      metadata = pdfData.metadata;
    } }).sort(PdfEntry.compareByRoom);
  };
};
