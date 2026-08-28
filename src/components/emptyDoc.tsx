import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { FileIcon, Plus } from "lucide-react";
import Link from "next/link";

const EmptyDoc = () => {
  return (
    <Empty className="border border-dashed mb-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileIcon />
        </EmptyMedia>
        <EmptyTitle>No documents</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any documents yet. Get started by creating your
          first document.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild className="cursor-pointer gap-2">
          <Link href="/documents/new">
            <Plus className="h-4 w-4" />
            Create new document
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
};

export default EmptyDoc;
