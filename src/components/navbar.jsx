import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel } from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { LogoutButton } from "@/components/client/logout-button";
import { SiNpm } from "react-icons/si";

export default async function Navbar() {

    const session = await auth.api.getSession({
        headers: await headers()
    });
    const user = session?.user || { name: null, email: null, image: null };
    const { name, email, image } = user;

    return (
        <div className="fixed top-0 left-0 w-full bg-card">
            <nav className=" border-b h-14 flex items-center px-4 gap-2">
                <Link href="/" className="flex items-center">
                    <Image
                        alt="Logo"
                        src="/logo.png"
                        height={100}
                        width={100}
                        className="size-10"
                    />
                    <h1 className="font-bold text-lg text-primary">devfast</h1>
                </Link>

                <div className="flex-1" />

                <a href="https://www.npmjs.com/package/devfast" target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#CD3737] hover:bg-[#CD3737] hover:opacity-80">
                        <SiNpm />
                        Install
                    </Button>
                </a>

                {session && (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-full">
                            <Avatar className="border-2 border-primary size-10">
                                <AvatarImage src={image ?? undefined} />
                                <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-54 shadow-lg" align="end">
                            <DropdownMenuLabel>
                                <p className="text-[16px]">{name}</p>
                                <p className="text-xs opacity-60">{email}</p>
                            </DropdownMenuLabel>
                            <LogoutButton className="w-full mt-2" variant="destructive" />
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </nav>
        </div>
    )
}
