import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <Link href="/login" className={buttonVariants()}>
        Get started
      </Link>
    </div>
  );
}
