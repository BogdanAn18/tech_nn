import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from './components/Header';
import { ThemeProvider } from './context/ThemeContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Монитор подписок",
  description: "Управляй своими подписками",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Header />
          <main style={{ 
            paddingTop: '62px', // Отступ для фиксированного хедера
            minHeight: '100vh',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            transition: 'background-color 0.3s, color 0.3s'
          }}>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}