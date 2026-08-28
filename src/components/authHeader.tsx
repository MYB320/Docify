import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { UserIcon, UserPlus, CircleDollarSign, LogIn } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User } from "better-auth";
import LogoutModal from "./logoutModal";

export const AuthHeader = ({ user }: { user?: User }) => {
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="cursor-pointer">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback>
              {user.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <UserIcon className="h-4 w-4 mr-2" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/billing" className="cursor-pointer">
              <CircleDollarSign className="h-4 w-4 mr-2" /> Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <LogoutModal />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <ButtonGroup>
      <Button className="bg-accent hover:bg-accent/50 text-foreground" asChild>
        <Link href="/login">
          <LogIn /> Login
        </Link>
      </Button>
      <Button className="group" variant="default" asChild>
        <Link href="/signup" className="">
          <UserPlus />
          <p className="transition-normal hidden group-hover:block">Signup</p>
        </Link>
      </Button>
    </ButtonGroup>
  );
};
