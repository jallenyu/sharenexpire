export type FileFetchResponse = {
    fileKey: string;
    url: string;
    expiresIn: number;
    expiresAt: number;
}

export type FileUploadResponse = {
    fileKey: string;
    expiresIn: number;
    expiresAt: number;
}