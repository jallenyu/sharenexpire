import { ServerCrash } from "lucide-react";

export default function ErrorScreen() {
    return (
        <>
            <ServerCrash className="w-10 h-10 text-red-500" />
            <h1 className="text-4xl font-bold">Something is wrong with server. Please refresh and try again.</h1>
        </>
    );
}
