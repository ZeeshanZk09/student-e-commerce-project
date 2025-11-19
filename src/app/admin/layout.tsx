import AdminLayout from '@/components/admin/AdminLayout';
import { authAdmin } from '@/lib/middlewares/authAdmin';
import UserProvider from '@/lib/provider/user-provider';
import { auth } from '@clerk/nextjs/server';

export const metadata = {
  title: 'GoCart. - Admin',
  description: 'GoCart. - Admin',
};

export default async function RootAdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) return <UnAuthorizedFallBackUI />;

  const isAdmin = await authAdmin(userId);
  if (!isAdmin) return <UnAuthorizedFallBackUI />;

  return (
    <>
      <UserProvider fallbackRedirectUrl='/admin'>
        <AdminLayout>{children}</AdminLayout>
      </UserProvider>
    </>
  );
}

export function UnAuthorizedFallBackUI() {
  return (
    <div className='min-h-screen flex justify-center items-center bg-gray-50'>
      <div className='max-w-md w-full'>
        <h1 className='text-3xl font-bold text-center mb-4'>Unauthorized</h1>
        <p className='text-center'>You are not authorized to access this page.</p>
      </div>
    </div>
  );
}
