export const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const VITE_CLIENT_BASE_URL = import.meta.env.VITE_CLIENT_BASE_URL as string;

export const faqData = [
    {
        value: "What is ShareNExpire?",
        description: "ShareNExpire is a secure file-sharing service where uploaded files automatically expire after a set time. No manual cleanup needed — your files disappear when the timer runs out."
    },
    {
        value: "How does it work?",
        description: "You upload a file. We generated a short link. The file is stored securely in the cloud along with a countdown timer. Once the timer expires, the file gets permanently deleted."
    },
    {
        value: "Do I need an account to use it?",
        description: "No. ShareNExpire is designed for quick, one-time file sharing. Just upload and share the link."
    },
    {
        value: "What expiration times can I choose?",
        description: "You can choose between: 1 minute, 30 minutes, 1 hour, or 24 hours."
    },
    {
        value: "Are my files secure?",
        description: "Yes, files are stored in a private cloud bucket. They are only accessible via the generated short link. You can also add a password for an extra layer of security."
    },
    {
        value: "What is the maximum file size?",
        description: "Currently, files up to 200 MB are supported."
    },
];