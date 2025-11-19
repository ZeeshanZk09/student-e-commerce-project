import { storesDummyData } from './../../../../public/assets/assets';
import StoreInfo from '@/components/admin/StoreInfo';
import { Store } from '@/generated/prisma/browser';
import { StoreCreateInput } from '@/generated/prisma/models';
import { auth } from '@clerk/nextjs/server';

async function getStores() {
  const { userId, getToken } = await auth();
  const token = await getToken();
  if (userId) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/active-store`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Add cache configuration as needed
        cache: 'no-store', // or 'force-cache' for static data
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stores: ${response.status}`);
      }

      const data = await response.json();
      console.log(response, data);
      return data.data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      // Fallback to dummy data if API fails
      return [];
    }
  }
  return [];
}

export default async function AdminStores() {
  let stores = [];
  stores = await getStores();

  // If you want to show loading state while fetching, you can use Suspense
  // Otherwise, the entire page will wait for the data
  const { userId, getToken } = await auth();
  const token = await getToken();
  const toggleIsActive = async (storeId: string, isActive: boolean) => {
    if (userId) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/active-store`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          // Add cache configuration as needed
          cache: 'no-store', // or 'force-cache' for static data
        });

        if (!response.ok) {
          throw new Error(`Failed to toggle: ${response.status}`);
        }
      } catch (error) {
        console.log(error);
      } finally {
        stores = await getStores();
      }
    }
  };

  return (
    <div className='text-slate-500 mb-28'>
      <h1 className='text-2xl'>
        Live <span className='text-slate-800 font-medium'>Stores</span>
      </h1>

      {stores.length ? (
        <div className='flex flex-col gap-4 mt-4'>
          {stores.map((store: Store | StoreCreateInput) => (
            <div
              key={store.id}
              className='bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl'
            >
              {/* Store Info */}
              <StoreInfo store={store as StoreCreateInput} />

              {/* Actions */}
              <div className='flex items-center gap-3 pt-2 flex-wrap'>
                <p>Active</p>
                <label className='relative inline-flex items-center cursor-pointer text-gray-900'>
                  <input
                    type='checkbox'
                    className='sr-only peer'
                    // Note: Toggle functionality would need to be handled differently
                    // in a server component. You might need a client-side wrapper
                    // or a separate API route handler
                    checked={store.isActive}
                    readOnly
                  />
                  <div className='w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200'></div>
                  <span className='dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4'></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='flex items-center justify-center h-80'>
          <h1 className='text-3xl text-slate-400 font-medium'>No stores Available</h1>
        </div>
      )}
    </div>
  );
}
