import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AI Learning Material Generator",
  description: "Ubah PDF menjadi materi ajar interaktif dalam hitungan detik",
  keywords: ["AI", "pendidikan", "kurikulum", "pembelajaran", "PDF", "generator"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(15, 15, 35, 0.95)",
              border: "1px solid rgba(124, 92, 248, 0.3)",
              color: "#e2e1ff",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </body>
    </html>
  );
}
