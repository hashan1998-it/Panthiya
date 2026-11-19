import Link from "next/link";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  const t = useTranslations("common");

  return (
    <div className="flex h-dvh items-center justify-center">
      <Link href="/login" className={buttonVariants()}>
        {t("getStarted")}
      </Link>
    </div>
  );
}
