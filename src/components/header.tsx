import Link, { LinkProps } from "next/link";
import Image from "next/image";
import { TextRoll } from "./ui/text-roll";
import { Url } from "next/dist/shared/lib/router/router";

type HeaderProps = {
  children?: React.ReactNode;
  link?: Url;
};

export default function Header({ children, link }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border hover:border-b-primary">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={link || "/"} className="flex items-center gap-1">
            <Image src="/docIcon.svg" alt="Logo" width={32} height={32} />
            <TextRoll className="text-2xl font-medium">Docify</TextRoll>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
