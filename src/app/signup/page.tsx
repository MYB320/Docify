import Link from "next/link";
import Image from "next/image";
import { TextRoll } from "@/components/ui/text-roll";
import { SignupForm } from "@/components/forms/signupForm";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href={"/"} className="flex items-center gap-2">
            <Image src="/docIcon.svg" alt="Logo" width={32} height={32} />
            <TextRoll className="text-2xl font-medium">Docify</TextRoll>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/docs.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2]"
        />
      </div>
    </div>
  );
}
