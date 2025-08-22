import { Modal, Button, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { FileFetchResponse } from '../types/FileResponse';
import { VITE_API_BASE_URL } from '../config';

interface PasswordScreenProps {
    onSuccess: () => void;
    onError: () => void;
    setFileData: React.Dispatch<React.SetStateAction<FileFetchResponse>>;
    fileId: string | undefined;
}

export default function PasswordScreen({ onSuccess, onError, setFileData, fileId }: PasswordScreenProps) {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            password: ""
        },
        validate: {
            password: (value: string) => (value.trim().length > 0 ? null : "Password is required"),
        },
    });


    const handleValidate = async (values: { password: string }) => {
        const params = new URLSearchParams({
            password: values.password
        });

        try {
            const res = await fetch(`${VITE_API_BASE_URL}/f/${fileId}?${params.toString()}`);
            if (res.status === 403) {
                form.setFieldError("password", "Incorrect password, try again.");
                return;
            }
            const data: FileFetchResponse = await res.json();
            setFileData(data);
            onSuccess();
        } catch {
            onError();
        }
    }

    return (
        <div>
            <Modal
                opened={true}
                onClose={() => { }}
                closeOnClickOutside={false}
                closeOnEscape={false}
                withCloseButton={false}
                title="Enter password to view the file"
                centered
            >
                <form onSubmit={form.onSubmit(handleValidate)} className='flex flex-col gap-4'>
                    <PasswordInput
                        label="Password"
                        placeholder=""
                        {...form.getInputProps("password")}
                    />
                    <Button type="submit" variant="filled">Unlock</Button>
                </form>
            </Modal>
        </div>
    );
}