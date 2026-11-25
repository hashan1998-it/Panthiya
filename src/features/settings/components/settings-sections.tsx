import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { PasswordForm } from "./password-form";
import { LanguageControl, ThemeControl } from "./preference-controls";

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-xl border border-border p-6 md:flex-row md:gap-8"
    >
      <div className="flex flex-col gap-1 md:w-64 md:shrink-0">
        <h2 id={id} className="text-title-md">
          {title}
        </h2>
        <p className="text-body-sm text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </section>
  );
}

export function SettingsSections() {
  const t = useTranslations("settings");

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Section
        id="settings-password"
        title={t("password.title")}
        description={t("password.description")}
      >
        <div className="max-w-sm">
          <PasswordForm />
        </div>
      </Section>
      <Section
        id="settings-language"
        title={t("language.title")}
        description={t("language.description")}
      >
        <LanguageControl label={t("language.title")} />
      </Section>
      <Section id="settings-theme" title={t("theme.title")} description={t("theme.description")}>
        <ThemeControl label={t("theme.title")} />
      </Section>
    </div>
  );
}
