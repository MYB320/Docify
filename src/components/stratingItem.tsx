"use client";
import { User } from "better-auth";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";
import Link from "next/link";

export const StartingItem = ({
  user,
  showActionBtn,
}: {
  user: User;
  showActionBtn?: boolean;
}) => {
  const getWelcomeMessage = (username: string) => {
    const welcomeMessages = [
      "Good Morning,",
      "Good Afternoon,",
      "Good Evening,",
    ];
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return `${welcomeMessages[0]} ${username}`; // Good morning
    } else if (currentHour >= 12 && currentHour < 18) {
      return `${welcomeMessages[1]} ${username}`; // Good afternoon
    } else {
      return `${welcomeMessages[2]} ${username}`; // Good evening
    }
  };

  return (
    <div className="flex justify-between items-center py-6">
      <div className="flex flex-col items-start gap-1">
        <h1 className="text-xl font-bold">{getWelcomeMessage(user?.name)}</h1>
        <p className="text-muted-foreground">
          Start creating your documents today!
        </p>
      </div>
      {showActionBtn && (
        <Button className="cursor-pointer" asChild>
          <Link href="/documents/new">
            <FilePlus2 className="h-4 w-4" />
            Create new document
          </Link>
        </Button>
      )}
    </div>
  );
};
