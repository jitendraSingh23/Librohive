import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock } from "lucide-react";
import Link from "next/link";

interface PdfPreviewProps {
  title: string;
  author: string;
  thumbnailUrl: string;
  pages: number;
  lastRead?: string;
}

export function PdfPreview({ title, author, thumbnailUrl, pages, lastRead }: PdfPreviewProps) {
  return (
    <Link href={`/pdfs/${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-[3/4]">
          <img
            src={thumbnailUrl}
            alt={title}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold line-clamp-2">{title}</h3>
            <p className="text-sm text-white/80">{author}</p>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>{pages} pages</span>
              {lastRead && (
                <>
                  <Clock className="h-4 w-4" />
                  <span>{lastRead}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

