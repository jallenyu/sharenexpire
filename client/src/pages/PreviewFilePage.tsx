import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ErrorScreen from "../components/ErrorScreen";
import PasswordScreen from "../components/PasswordScreen";
import PreviewScreen from "../components/PreviewScreen";
import NotFoundScreen from "../components/NotFoundScreen";
import type { FileFetchResponse } from "../types/FileResponse";
import type { PreviewStage } from "../types/Stage";
import { VITE_API_BASE_URL } from "../config";

export default function PreviewFilePage() {
    const [stage, setStage] = useState<PreviewStage>("idle");
    const [fileData, setFileData] = useState<FileFetchResponse>(
        {
            fileKey: "",
            url: "",
            expiresIn: 1,
            expiresAt: 1
        });
    const { fileId } = useParams<{ fileId: string }>();

    useEffect(() => {
        const fetchFile = async () => {
            try {
                const res = await fetch(`${VITE_API_BASE_URL}/f/${fileId}`);
                if (res.status === 401) { // Password protected
                    setStage("password");
                    return;
                }
                if (res.status === 404) { // File not found/exist
                    setStage("not-found");
                    return;
                }
                const data: FileFetchResponse = await res.json();
                setFileData(data);
                setStage("preview");
            } catch {
                setStage("error"); // network/server error
            }
        };
        fetchFile();
    }, [fileId]);

    return (
        <>
            {stage === "password" &&
                <PasswordScreen
                    onSuccess={() => setStage("preview")}
                    onError={() => setStage("error")}
                    setFileData={setFileData}
                    fileId={fileId}
                />}
            {stage === "preview" && <PreviewScreen fileData={fileData} onNotFound={() => setStage("not-found")} />}
            {stage === "not-found" && <NotFoundScreen />}
            {stage === "error" && <ErrorScreen />}
        </>
    );
}