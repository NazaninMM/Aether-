import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Nav from "@/components/Nav";
import SetupBanner from "@/components/SetupBanner";

export const metadata: Metadata = {
  title: "Aether — Goal Planner",
  description: "Your personal goal planning system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Nav />
          <SetupBanner />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
