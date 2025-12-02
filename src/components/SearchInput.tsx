'use client';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function SearchInput() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className='hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full'
    >
      <Search size={18} className='text-slate-600' />
      <input
        className='w-full bg-transparent outline-none placeholder-slate-600'
        type='text'
        placeholder='Search products'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        required
      />
    </form>
  );
}
