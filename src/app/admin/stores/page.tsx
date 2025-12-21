import StoreInfo from '@/components/admin/StoreInfo';
import ToggleStatus from './_component/toggle-status';
import { getStores } from '@/lib/sever-action/store';
import { Store } from '@/generated/prisma/browser';

export const revalidate = 0;

export default async function AdminStores() {
  let stores: Store[] | undefined = [];
  stores = await getStores();

  return (
    <div className='text-slate-500 mb-28'>
      <h1 className='text-2xl'>
        Live <span className='text-slate-800 font-medium'>Stores</span>
      </h1>

      {stores?.length ? (
        <div className='flex flex-col gap-4 mt-4'>
          {stores.map((store) => (
            <div
              key={store.id}
              className='bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl'
            >
              {/* Store Info */}
              <StoreInfo store={store} />

              {/* Actions */}
              <ToggleStatus storeId={store.id} />
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
