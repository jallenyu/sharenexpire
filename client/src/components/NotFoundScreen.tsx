import { FileX } from "lucide-react";

export default function NotFoundScreen() {
    return (
        <>
            <FileX className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl font-bold">File expired or not exist.</h1>
        </>
    );
}
