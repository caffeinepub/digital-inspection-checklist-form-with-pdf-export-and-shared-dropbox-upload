import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PdfBinary = Uint8Array;
export interface ChecklistSection {
    id: string;
    description: string;
    binaryFields: Array<BinaryField>;
    yesNoFields: Array<YesNoField>;
    textFields: Array<TextField>;
}
export interface PdfMetadata {
    uploadTimestamp: bigint;
}
export type FieldValue = {
    __kind__: "no";
    no: null;
} | {
    __kind__: "yes";
    yes: null;
} | {
    __kind__: "noAnswer";
    noAnswer: null;
} | {
    __kind__: "notAppicable";
    notAppicable: null;
} | {
    __kind__: "text";
    text: string;
} | {
    __kind__: "notTested";
    notTested: null;
};
export type Room = string;
export type UploadResult = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: string;
};
export interface YesNoField {
    id: string;
    value: FieldValue;
    description: string;
}
export interface RoomChecklist {
    checklistSections: Array<ChecklistSection>;
}
export type DropboxToken = string;
export interface PdfEntry {
    pdf: PdfBinary;
    metadata: PdfMetadata;
    room: Room;
}
export interface BinaryField {
    id: string;
    value: FieldValue;
    description: string;
}
export interface TextField {
    id: string;
    value: FieldValue;
    description: string;
}
export interface MetadataAndPdf {
    pdf: PdfBinary;
    metadata: PdfMetadata;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    areAdminPrivilegesAvailable(): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimAdminPrivileges(): Promise<void>;
    getAllSortedByRoom(): Promise<Array<PdfEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDropboxToken(): Promise<DropboxToken | null>;
    getPdf(room: Room): Promise<MetadataAndPdf>;
    getRoomChecklist(room: Room): Promise<RoomChecklist | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveRoomChecklist(_room: Room, _checklist: RoomChecklist): Promise<UploadResult>;
    setDropboxToken(token: DropboxToken): Promise<void>;
    uploadPdf(_room: Room, _pdf: PdfBinary, _timestamp: bigint): Promise<UploadResult>;
}
