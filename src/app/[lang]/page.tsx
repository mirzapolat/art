import { notFound } from "next/navigation";
import Experience from "@/components/experience";
import { hasLocale, locales } from "@/i18n/config";

// Declared on the page as well as the layout: the static export checks the page.
export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <Experience initialLocale={lang} />;
}
