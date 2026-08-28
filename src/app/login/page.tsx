import Link from "next/link";
import Image from "next/image";
import { TextRoll } from "@/components/ui/text-roll";
import { LoginForm } from "@/components/forms/loginForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link href={"/"} className="flex items-center justify-center gap-2">
          <Image src="/docIcon.svg" alt="Logo" width={32} height={32} />
          <TextRoll className="text-2xl font-medium">Docify</TextRoll>
        </Link>
        <Card className="relative">
          <CardHeader>
            <CardTitle className="text-xl">Welcome back!</CardTitle>
            <CardDescription>Enter your email below to login</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
