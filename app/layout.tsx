import { Bricolage_Grotesque, IBM_Plex_Mono, Noto_Sans_KR } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { CustomCursor } from "@/components/ui/CustomCursor";

export const metadata: Metadata = {
  title: "ykk — 탐험형 AI 레시피 마켓",
  description: "검증된 AI 레시피·노하우를 무한 캔버스에서 발견하고 재현하는 마켓. make it, prove it.",
};

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        <Providers>{children}</Providers>
        <CustomCursor />
      </body>
    </html>
  );
}