import { Button, CopyButton, Input, Space } from "@mantine/core";

interface SuccessScreenProps {
    url: string;
    onReset: () => void;
}

export default function SuccessScreen({ url, onReset }: SuccessScreenProps) {
    return (
        <div>
            <h1 className="text-4xl font-bold text-center">We do not store history</h1>
            <h1 className="text-2xl font-bold text-center">Click to save your link now!</h1>
            <Space h="md" />
            <CopyButton value={url}>
                {({ copied, copy }) => (
                    <Input component="button" pointer onClick={copy}>
                        {copied ? 'URL copied!' : url}
                    </Input>
                )}
            </CopyButton>
            <Space h="md" />
            <Button variant="filled" onClick={onReset}>Share another</Button>
        </div>
    );
}