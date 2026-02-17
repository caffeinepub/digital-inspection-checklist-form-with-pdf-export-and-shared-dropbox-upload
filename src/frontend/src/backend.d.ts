import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MetadataAndPdf {
    pdf: PdfBinary;
    metadata: PdfMetadata;
}
export type PdfBinary = Uint8Array;
export interface PdfMetadata {
    uploadTimestamp: bigint;
}
export type DropboxToken = string;
export type Room = string;
export interface PdfEntry {
    pdf: PdfBinary;
    metadata: PdfMetadata;
    room: Room;
}
export interface UserProfile {
    name: string;
}
export type UploadResult = {
    __kind__: "error";
    error: string;
} | {
    __kind__: "success";
    success: string;
};
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
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setDropboxToken(token: DropboxToken): Promise<void>;
    uploadPdf(_room: Room, _pdf: PdfBinary, _timestamp: bigint): Promise<UploadResult>;
}
