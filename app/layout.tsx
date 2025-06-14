import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Social Media Image Format Converter</title>
        <link rel="icon" href="https://icones.pro/wp-content/uploads/2021/06/icone-d-image-bleue.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
