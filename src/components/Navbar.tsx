"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Bot, LogOut, MessageCircle, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/chat" className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-emerald-600" />
          <span className="text-xl font-bold text-gray-900">Yusuf AI</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/chat">
            <Button
              variant={pathname === "/chat" ? "default" : "ghost"}
              className={pathname === "/chat" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant={pathname === "/dashboard" ? "default" : "ghost"}
              className={pathname === "/dashboard" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>

          {user && (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5 text-gray-600" />
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
