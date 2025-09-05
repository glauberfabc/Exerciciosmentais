import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exercícios Mentais - Programa de Treinamento Cognitivo",
  description: "Fortaleça sua memória e previna doenças como Alzheimer e demência com exercícios mentais gamificados. Quiz interativo com resultados comprovados.",
  keywords: ["exercícios mentais", "memória", "Alzheimer", "demência", "treinamento cognitivo", "prevenção", "saúde mental"],
  authors: [{ name: "Exercícios Mentais" }],
  openGraph: {
    title: "Exercícios Mentais - Fortaleça Sua Memória",
    description: "Programa completo de exercícios mentais para melhorar memória, concentração e prevenir doenças cognitivas.",
    url: "https://exerciciosmentais.com",
    siteName: "Exercícios Mentais",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Exercícios Mentais - Fortaleça Sua Memória",
    description: "Programa completo de exercícios mentais para melhorar memória, concentração e prevenir doenças cognitivas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
