import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Old actor state type without adminClaimed
  type OldActor = {
    pdfs : Map.Map<Text, {
      metadata : { uploadTimestamp : Nat64 };
      pdf : Blob;
    }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    dropboxToken : ?Text;
  };

  // New actor state type with adminClaimed
  type NewActor = {
    pdfs : Map.Map<Text, {
      metadata : { uploadTimestamp : Nat64 };
      pdf : Blob;
    }>;
    userProfiles : Map.Map<Principal, { name : Text }>;
    dropboxToken : ?Text;
    adminsClaimed : Bool;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    { old with adminsClaimed = false };
  };
};
