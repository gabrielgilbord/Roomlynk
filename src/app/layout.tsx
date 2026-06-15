import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "RoomLynk — Coliving sin fricción",
  description:
    "Gestiona habitaciones, contratos firmados y gastos compartidos. Hecho para caseros e inquilinos reales.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${ibmPlex.variable} h-full`}
    >
      <body className="min-h-full rl-grain">{children}</body>
    </html>
  );
}
