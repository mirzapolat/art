import LocaleRedirect from "@/components/locale-redirect";

/** `/` has no language of its own: it sends visitors on to /de/ or /en/. */
export default function Root() {
  return <LocaleRedirect />;
}
