import OrdersAreaChart from '@/components/OrdersAreaChart';
import { CircleDollarSignIcon, ShoppingBasketIcon, StoreIcon, TagsIcon } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';

export default async function AdminDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

  // Clerk server-side
  const { userId, getToken } = await auth();

  const token = await getToken();

  // Default dashboard data
  let dashboardData = {
    products: 0,
    revenue: 0,
    orders: 0,
    stores: 0,
    allOrders: [],
  };

  if (userId) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        console.log(data.data.revenue._sum.total);
        dashboardData = {
          products: data.data.products.length,
          stores: data.data.stores.length,
          orders: data.data.orders.length,
          allOrders: data.data.allOrders,
          revenue: data.data.revenue._sum.total ?? 0,
        };
      }
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
    }
  }
  console.log(dashboardData);
  const dashboardCardsData = [
    { title: 'Total Products', value: dashboardData.products, icon: ShoppingBasketIcon },
    {
      title: 'Total Revenue',
      value: currency + dashboardData.revenue,
      icon: CircleDollarSignIcon,
    },
    { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon },
    { title: 'Total Stores', value: dashboardData.stores, icon: StoreIcon },
  ];

  return (
    <div className='text-slate-500'>
      <h1 className='text-2xl'>
        Admin <span className='text-slate-800 font-medium'>Dashboard</span>
      </h1>

      {/* Cards */}
      <div className='flex flex-wrap gap-5 my-10 mt-4'>
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className='flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg'
          >
            <div className='flex flex-col gap-3 text-xs'>
              <p>{card.title}</p>
              <b className='text-2xl font-medium text-slate-700'>{card.value}</b>
            </div>
            <card.icon
              size={50}
              className='w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full'
            />
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <OrdersAreaChart allOrders={dashboardData.allOrders} />
    </div>
  );
}
