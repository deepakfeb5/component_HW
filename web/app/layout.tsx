import "./globals.css";

export const metadata = {
  title: "Mouser BOM Tool",
  description: "Upload BOM CSV and get Mouser pricing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
