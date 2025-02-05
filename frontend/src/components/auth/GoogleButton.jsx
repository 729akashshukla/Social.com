import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../utils/api';

export default function CompleteProfileModal({ user }) {
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    if (user && !user.registrationComplete) {
      // Show modal logic
    }
  }, [user]);

  const onSubmit = async (data) => {
    await api.patch('/auth/complete-google-registration', data);
    // Close modal and update user
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Complete Your Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('firstName')}
            placeholder="First Name"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            {...register('username')}
            placeholder="Username"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          {/* Add other required fields */}
          
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}