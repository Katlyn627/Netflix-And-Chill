export const metadata = {
  title: 'Netflix & Chill - Find Your Perfect Streaming Partner',
  description: 'Match with people who share your streaming preferences, watch history, and binge-watching habits',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#E50914" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
