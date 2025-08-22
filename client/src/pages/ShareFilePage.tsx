import { useState } from "react";
import UploadForm from "../components/UploadForm";
import SuccessScreen from "../components/SuccessScreen";
import ErrorScreen from "../components/ErrorScreen";
import type { ShareStage } from "../types/Stage";

export default function ShareFilePage() {
    const [fileUrl, setFileUrl] = useState<string>("");
    const [stage, setStage] = useState<ShareStage>("upload");

    return (
        <>
            {stage === "upload" && <UploadForm onSuccess={() => setStage("success")} onError={() => setStage("error")} setFileUrl={setFileUrl} />}
            {stage === "success" && <SuccessScreen url={fileUrl} onReset={() => setStage("upload")} />}
            {stage === "error" && <ErrorScreen />}
        </>
    );
}