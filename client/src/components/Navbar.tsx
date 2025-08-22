import { Anchor } from "@mantine/core";

export default function Navbar() {
    return (
        <header className="shadow-md flex justify-center gap-4 p-4">
            <Anchor underline="never" href="/" fw={500} fz="lg">ShareNExpire</Anchor>
            <Anchor underline="never" href="/faq" fw={500} fz="lg">FAQ</Anchor>
        </header>
    );
}
