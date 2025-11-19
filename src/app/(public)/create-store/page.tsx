'use client';
import { assets } from './../../../../public/assets/assets';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import axios from 'axios';
import { SignedIn, SignedOut, SignIn, useAuth, useUser } from '@clerk/nextjs';
import UserProvider from '@/lib/provider/user-provider';

interface StoreInfo {
  name: string;
  description: string;
  username: string;
  address: string;
  email: string;
  contact: string;
  logo: File | string;
}

interface StoreStatus {
  storeStatus: 'approved' | 'rejected' | 'pending' | null;
}

export default function CreateStore() {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [status, setStatus] = useState<'approved' | 'rejected' | 'pending' | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();

  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    name: '',
    description: '',
    username: '',
    address: '',
    email: '',
    contact: '',
    logo: '',
  });

  // Memoized change handler
  const onChangeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setStoreInfo((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // Memoized file handler
  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size (max 5MB)
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setStoreInfo((prev) => ({ ...prev, logo: file }));
    }
  }, []);

  // Fetch store status with error handling
  const fetchSellerStatus = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.get<{ data: StoreStatus }>('/api/create-store', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.data.storeStatus) {
        setStatus(data.data.storeStatus);
        const isSubmitted =
          data.data.storeStatus === 'approved' || data.data.storeStatus === 'pending';
        setAlreadySubmitted(isSubmitted);

        const statusMessages = {
          approved: 'Store Approved',
          rejected: 'Store Rejected',
          pending: 'Store Pending',
        };

        const message = statusMessages[data.data.storeStatus];
        toast.success(message);
      }
    } catch (error) {
      console.error('Failed to fetch store status:', error);
      toast.error('Failed to load store status');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Form submission handler
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!storeInfo.name.trim() || !storeInfo.username.trim() || !storeInfo.email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(storeInfo).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'string' && value.trim()) {
          formData.append(key, value.trim());
        }
      });
      const token = await getToken();

      const { data } = await axios.post('/api/create-store', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(data.message || 'Store submitted successfully!');
      await fetchSellerStatus(); // Refresh status after submission
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit store');
    } finally {
      setSubmitting(false);
    }
  };

  // Effect to fetch store status when user is loaded
  useEffect(() => {
    if (userLoaded && user) {
      fetchSellerStatus();
    }
  }, [userLoaded, user, fetchSellerStatus]);

  // Show loading while checking user or initial data
  if (loading || !userLoaded) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <Loading />
      </div>
    );
  }

  // Show status message if already submitted
  if (alreadySubmitted) {
    return (
      <div className='min-h-[80vh] flex flex-col items-center justify-center px-4'>
        <div className='text-center max-w-2xl'>
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              status === 'approved'
                ? 'bg-green-100 text-green-600'
                : status === 'rejected'
                ? 'bg-red-100 text-red-600'
                : 'bg-yellow-100 text-yellow-600'
            }`}
          >
            {status === 'approved' ? '✓' : status === 'rejected' ? '✗' : '⏳'}
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            {status === 'approved'
              ? 'Store Approved!'
              : status === 'rejected'
              ? 'Store Rejected'
              : 'Store Under Review'}
          </h2>
          <p className='text-gray-600 mb-6'>
            {status === 'approved'
              ? 'Your store has been approved and is now live on GoCart.'
              : status === 'rejected'
              ? 'Your store application was not approved. Please contact support for more information.'
              : 'Your store is currently under review. We will notify you once approved.'}
          </p>

          {status === 'approved' && (
            <div className='animate-pulse text-sm text-gray-500'>
              Redirecting to dashboard in <span className='font-semibold'>5 seconds</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <UserProvider fallbackRedirectUrl='/create-store'>
      <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-2xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              Add Your <span className='text-blue-600'>Store</span>
            </h1>
            <p className='text-gray-600 max-w-lg mx-auto'>
              To become a seller on GoCart, submit your store details for review. Your store will be
              activated after admin verification.
            </p>
          </div>

          {/* Store Form */}
          <form
            onSubmit={onSubmitHandler}
            className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6'
          >
            {/* Logo Upload */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Store Logo</label>
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <Image
                    src={
                      storeInfo.logo && typeof storeInfo.logo !== 'string'
                        ? URL.createObjectURL(storeInfo.logo)
                        : assets.upload_area
                    }
                    className='rounded-lg h-20 w-20 object-cover border-2 border-dashed border-gray-300'
                    alt='Store logo preview'
                    width={80}
                    height={80}
                  />
                </div>
                <label className='cursor-pointer'>
                  <div className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'>
                    Choose File
                  </div>
                  <input type='file' accept='image/*' onChange={onFileChange} className='hidden' />
                </label>
              </div>
              <p className='text-xs text-gray-500 mt-1'>Recommended: Square image, max 5MB</p>
            </div>

            {/* Form Fields */}
            {[
              {
                label: 'Username',
                name: 'username',
                type: 'text',
                required: true,
                placeholder: 'Enter your store username',
              },
              {
                label: 'Store Name',
                name: 'name',
                type: 'text',
                required: true,
                placeholder: 'Enter your store name',
              },
              {
                label: 'Email',
                name: 'email',
                type: 'email',
                required: true,
                placeholder: 'Enter your store email',
              },
              {
                label: 'Contact Number',
                name: 'contact',
                type: 'text',
                required: false,
                placeholder: 'Enter your store contact number',
              },
            ].map((field) => (
              <div key={field.name}>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  {field.label}
                  {field.required && <span className='text-red-500 ml-1'>*</span>}
                </label>
                <input
                  name={field.name}
                  type={field.type}
                  onChange={onChangeHandler}
                  value={storeInfo[field.name as keyof StoreInfo] as string}
                  placeholder={field.placeholder}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
                  required={field.required}
                />
              </div>
            ))}

            {/* Description */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Description
                <span className='text-red-500 ml-1'>*</span>
              </label>
              <textarea
                name='description'
                onChange={onChangeHandler}
                value={storeInfo.description}
                rows={4}
                placeholder='Enter your store description'
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors'
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Address
                <span className='text-red-500 ml-1'>*</span>
              </label>
              <textarea
                name='address'
                onChange={onChangeHandler}
                value={storeInfo.address}
                rows={3}
                placeholder='Enter your store address'
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors'
                required
              />
            </div>

            {/* Submit Button */}
            <div className='pt-4'>
              <button
                type='submit'
                disabled={submitting}
                className='w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {submitting ? 'Submitting...' : 'Submit Store Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </UserProvider>
  );
}
