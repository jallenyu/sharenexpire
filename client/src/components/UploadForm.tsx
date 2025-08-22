import { FileInput, NativeSelect, PasswordInput, Button, Space } from '@mantine/core';
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


export default function UploadForm({ onSuccess, onError, setFileUrl }: UploadFormProps) {
    const [loading, setLoading] = useState(false);
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
        if (values.file!.size > 200 * 1024 * 1024) {
            form.setFieldError("file", "File size limit is 200MB");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", values.file!);
            formData.append("expiresIn", values.expiresIn);

            if (values.password.trim() !== "") {
                formData.append("password", values.password);
            }

            const res = await fetch(`${VITE_API_BASE_URL}/upload`, {
                method: "POST",
                body: formData
            })

            const data: FileUploadResponse = await res.json();
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
                    <Button type="submit" variant="filled" loading={loading}>Share</Button>
                </div>
            </form>
        </div>
    );
}