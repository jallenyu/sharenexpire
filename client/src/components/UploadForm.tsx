import { FileInput, NativeSelect, PasswordInput, Button, Space, Progress, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { VITE_API_BASE_URL, VITE_CLIENT_BASE_URL } from '../config';
import type { FileUploadResponse } from '../types/FileResponse';
import { useState } from 'react';

interface UploadFormProps {
    onSuccess: () => void;
    onError: () => void;
    setFileUrl: React.Dispatch<React.SetStateAction<string>>;
}

interface UploadFormValues {
    file: File | null;
    expiresIn: string;
    password: string;
}

const PART_SIZE = 10 * 1024 * 1024; // 10 MB per chunk

const uploadMultipart = async (
    file: File,
    expiresIn: string,
    password: string,
    onProgress: (pct: number) => void
): Promise<FileUploadResponse> => {

    // Step 1: Initiate multipart upload
    const initiateRes = await fetch(`${VITE_API_BASE_URL}/upload/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/octet-stream",
        }),
    });

    if (!initiateRes.ok) throw new Error("Failed to initiate upload");
    const { uploadId, fileKey, partSize } = await initiateRes.json();
    const resolvedPartSize = partSize ?? PART_SIZE;

    // Step 2: Upload each chunk directly to S3 via presigned URLs
    const totalParts = Math.ceil(file.size / resolvedPartSize);
    const completedParts: { PartNumber: number; ETag: string }[] = [];

    for (let i = 0; i < totalParts; i++) {
        const partNumber = i + 1;
        const start = i * resolvedPartSize;
        const end = Math.min(start + resolvedPartSize, file.size);
        const chunk = file.slice(start, end);

        const presignRes = await fetch(`${VITE_API_BASE_URL}/upload/presign-part`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileKey, uploadId, partNumber }),
        });

        if (!presignRes.ok) throw new Error(`Failed to get presigned URL for part ${partNumber}`);
        const { presignedUrl } = await presignRes.json();

        const uploadRes = await fetch(presignedUrl, {
            method: "PUT",
            body: chunk,
        });

        if (!uploadRes.ok) throw new Error(`Failed to upload part ${partNumber}`);

        const etag = uploadRes.headers.get("ETag");
        if (!etag) throw new Error(`No ETag returned for part ${partNumber}`);

        completedParts.push({ PartNumber: partNumber, ETag: etag });
        onProgress(Math.round((partNumber / totalParts) * 100));
    }

    // Step 3: Complete the multipart upload
    const completeRes = await fetch(`${VITE_API_BASE_URL}/upload/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fileKey,
            uploadId,
            parts: completedParts,
            expiresIn,
            password: password.trim() || undefined,
        }),
    });

    if (!completeRes.ok) throw new Error("Failed to complete upload");
    return completeRes.json();
};


export default function UploadForm({ onSuccess, onError, setFileUrl }: UploadFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const form = useForm<UploadFormValues>({
        mode: 'uncontrolled',
        initialValues: {
            file: null,
            expiresIn: "60",
            password: ""
        },
        validate: {
            file: (value) => (value ? null : "File is required"),
        },
    });

    const handleShare = async (values: typeof form.values) => {
        setLoading(true);
        setUploadProgress(0);
        try {
            const data = await uploadMultipart(
                values.file!,
                values.expiresIn,
                values.password,
                setUploadProgress
            );

            const fileId = data.fileKey.split("-", 1)[0];
            setFileUrl(`${VITE_CLIENT_BASE_URL}/file/${fileId}`);
        } catch {
            onError();
        } finally {
            setLoading(false);
            onSuccess();
        }
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-center">Upload and share temporary files</h1>
            <Space h="md" />
            <form onSubmit={form.onSubmit(handleShare)}>
                <div className='flex flex-col gap-4'>
                    <FileInput
                        withAsterisk
                        clearable
                        label="Choose file"
                        placeholder="Choose file"
                        {...form.getInputProps("file")}
                    />
                    <NativeSelect
                        withAsterisk
                        label="Expires in"
                        data={[
                            { value: "60", label: "1 minute" },
                            { value: "1800", label: "30 minutes" },
                            { value: "3600", label: "1 hour" },
                            { value: "86400", label: "24 hours" },
                        ]}
                        {...form.getInputProps("expiresIn")}
                    />
                    <PasswordInput
                        label="Password (Optional)"
                        placeholder="Password is optional"
                        {...form.getInputProps("password")}
                    />
                    {loading && (
                        <>
                            <Progress value={uploadProgress} animated />
                            <Text size="sm" c="dimmed" ta="center">{uploadProgress}%</Text>
                        </>
                    )}
                    <Button type="submit" variant="filled" loading={loading}>Share</Button>
                </div>
            </form>
        </div>
    );
}