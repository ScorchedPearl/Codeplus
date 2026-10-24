import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="CodePlus home" className={clsx("inline-flex items-center", className)}>
      <Image src="/brand/codeplus-logo.svg" alt="CodePlus" width={722} height={113} priority className="h-5 w-auto sm:h-6" />
    </Link>
  );
}
