import Map "mo:core/Map";
import Blob "mo:core/Blob";
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
  public type DropboxToken = Text;

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

  // Checklist types
  public type FieldValue = {
    #yes;
    #no;
    #notAppicable;
    #notTested;
    #noAnswer;
    #text : Text;
  };

  public type YesNoField = {
    id : Text;
    description : Text;
    value : FieldValue;
  };

  public type TextField = {
    id : Text;
    description : Text;
    value : FieldValue;
  };

  public type BinaryField = {
    id : Text;
    description : Text;
    value : FieldValue;
  };

  public type ChecklistSection = {
    id : Text;
    description : Text;
    yesNoFields : [YesNoField];
    textFields : [TextField];
    binaryFields : [BinaryField];
  };

  public type RoomChecklist = {
    checklistSections : [ChecklistSection];
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
  let checklists = Map.empty<Room, RoomChecklist>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var dropboxToken : ?DropboxToken = null;

  // Checklist management (persistent version)
  public query ({ caller }) func getRoomChecklist(room : Room) : async ?RoomChecklist {
    checklists.get(room);
  };

  public shared ({ caller }) func saveRoomChecklist(_room : Room, _checklist : RoomChecklist) : async UploadResult {
    // should only be done by admin or future delegator/operator feature
    Runtime.trap("Checklist should be updated only from the web. You should not save the persisted version.");
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Admin claim tracking
  var adminsClaimed : Bool = false;

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

  // PDF upload
  public shared ({ caller }) func uploadPdf(_room : Room, _pdf : PdfBinary, _timestamp : Nat64) : async UploadResult {
    Runtime.trap("Upload should be frontend only. Backend upload not implemented. ");
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

  // Admin privileges management
  public shared ({ caller }) func claimAdminPrivileges() : async () {
    // Require authenticated user before allowing admin claim
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can claim admin privileges");
    };
    if (adminsClaimed) {
      Runtime.trap("Admin privileges have already been claimed.");
    };
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
    adminsClaimed := true;
  };

  public query ({ caller }) func areAdminPrivilegesAvailable() : async Bool {
    not adminsClaimed;
  };
};
