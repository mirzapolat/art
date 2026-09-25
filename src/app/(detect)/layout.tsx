import "@fontsource-variable/jost";
import "../globals.css";
import { rootMetadata } from "@/i18n/metadata";

export { viewport } from "@/i18n/metadata";
export const metadata = rootMetadata;

export default function DetectLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
