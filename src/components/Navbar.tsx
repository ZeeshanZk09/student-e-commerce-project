import Link from 'next/link';
import SearchInput from './SearchInput';
import NavClientMobile, { NavClientDesktop } from './NavClient';
import { auth } from '@clerk/nextjs/server';
import { authAdmin } from '@/lib/middlewares/authAdmin';
import authSeller from '@/lib/middlewares/authSeller';
import CartCount from './CartCount';

export const revalidate = 0;

export default async function Navbar() {
  const { userId } = await auth();
  const isAdmin = await authAdmin(userId!);
  const isSeller = await authSeller(userId!);
  console.log('is user is seller or not: ', isSeller);
  return (
    <nav className='relative bg-white'>
      <div className='mx-6'>
        <div className='flex items-center justify-between max-w-7xl mx-auto py-4  transition-all'>
          <Link href='/' className='relative text-4xl font-semibold text-slate-700'>
            <span className='text-green-600'>go</span>cart
            <span className='text-green-600 text-5xl leading-0'>.</span>
            <p className='absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500'>
              plus
            </p>
          </Link>

          {/* Desktop Menu */}
          <div className='hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600'>
            <Link href='/'>Home</Link>
            <Link href='/shop'>Shop</Link>
            <Link href='/'>About</Link>
            <Link href='/'>Contact</Link>

            <SearchInput />
            <CartCount />
            <NavClientDesktop userId={userId} isAdmin={isAdmin} isSeller={isSeller} />
          </div>

          {/* Mobile User Button  */}
          <NavClientMobile userId={userId} isAdmin={isAdmin} isSeller={isSeller} />
        </div>
      </div>
      <hr className='border-gray-300' />
    </nav>
  );
}
