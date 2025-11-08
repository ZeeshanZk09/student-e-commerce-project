import { Outfit } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import StoreProvider from '@/app/StoreProvider';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600'] });

export const metadata = {
  title: 'GoCart. - Shop smarter',
  description: 'GoCart. - Shop smarter',
  keywords: 'e-commerce, online shopping, shop, cart, products, deals, discounts, GoCart',
  authors: [{ name: 'Zeeshan Ahmad', url: 'https://zeeshanahmad.dev' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <head>
          <meta
            name='google-site-verification'
            content='LbJ6OSYiIhXzVXQyoAPGa3CUqgYhYJ4lwA89fEVybtM'
          />
        </head>
        <body className={`${outfit.className} antialiased`}>
          <StoreProvider>
            <Toaster />
            {children}
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
