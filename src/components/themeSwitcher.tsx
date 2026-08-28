"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Wait until mounted
  return (
    <div>
      <ToggleGroup
        type="single"
        value={theme}
        onValueChange={(value) => setTheme(value)}
      >
        <ToggleGroupItem value="light">
          <Sun
            className={cn("w-4 h-4", theme === "light" ? "text-primary" : "")}
          />
        </ToggleGroupItem>
        <ToggleGroupItem value="dark">
          <Moon
            className={cn("w-4 h-4", theme === "dark" ? "text-primary" : "")}
          />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
