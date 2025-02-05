import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../utils/api';

export default function OTPModal({ email, onVerify }) {
  const { register, handleSubmit } = useForm();

  const onSubmit = async ({ otp }) => {
    try {
      await api.post('/auth/verify-otp', { email, otp });
      onVerify();
    } catch (error) {
      console.error('OTP verification failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register('otp')}
            placeholder="Enter OTP"
            className="border p-2 rounded w-full mb-4"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}