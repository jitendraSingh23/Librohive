import Link from "next/link";
import logo from "../public/img/LibroHivelogo.svg";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <div>
      <footer className="border-t pt-6 md:py-0 px-10">
        <div className="container flex  items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2 w-1/4 md:w-1/12">
           <Image src={logo} alt="librohive" />
          </div>
          <p className="hidden md:flex text-center text-sm leading-loose text-muted-foreground">
            © {currentYear} LibroHive. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:underline"
            >
              Contact
            </Link>
          </div>
        </div>
          <p className="md:hidden text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 LibroHive. All rights reserved.
          </p>
      </footer>
    </div>
  );
}
