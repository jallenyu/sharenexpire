import { Button } from "@mantine/core";
import type { FileFetchResponse } from "../types/FileResponse";
import { useCountdown } from "../hooks/useCountdown";
import { useEffect } from "react";

interface PreviewScreenProps {
    fileData: FileFetchResponse;
    onNotFound: () => void;
}


export default function PreviewScreen({ fileData, onNotFound }: PreviewScreenProps) {
    const fileName = fileData.fileKey.split("-", 2)[1];
    const secondsLeft = useCountdown(fileData.expiresIn);
    const ext = fileName.split(".").pop()?.toLowerCase();
    const isVideo = ext && ["mp4", "webm", "ogg"].includes(ext);

    useEffect(() => {
        if (secondsLeft === 0) onNotFound();
    }, [secondsLeft]);

    const formatTime = (s: number) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;

        if (h > 0) {
            // Show HH:MM:SS
            return `${h}:${m.toString().padStart(2, "0")}:${sec
                .toString()
                .padStart(2, "0")}`;
        } else {
            // Show MM:SS
            return `${m}:${sec.toString().padStart(2, "0")}`;
        }
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = fileData.url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl">File name: {fileName}</h1>
            <h1 className="text-2xl">This link will expire in <span>{formatTime(secondsLeft)}</span></h1>

            <div className="w-full max-w-2xl">
                {isVideo ? (
                    <video
                        src={fileData.url}
                        controls
                        className="w-full max-h-[500px] rounded shadow"
                    />
                ) : (
                    <div className="text-2xl">
                        Preview not available for this file type.
                    </div>
                )}
            </div>

            <Button variant="filled" onClick={handleDownload}>Download</Button>
        </div>
    );
}