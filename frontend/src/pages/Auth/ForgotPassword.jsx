import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import PhoneInput from '../../components/auth/PhoneInput';
import { setValue } from '../../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('email');
  const { register, handleSubmit, watch } = useForm();
  const identifier = watch(method === 'email' ? 'email' : 'phone');

  const sendOTP = async () => {
    await api.post('/auth/forgot-password', method === 'email' ? 
      { email: identifier } : 
      { phone: identifier }
    );
    setStep(2);
  };

  const handleReset = async (data) => {
    await api.post('/auth/reset-password', {
      [method === 'email' ? 'email' : 'phone']: identifier,
      otp: data.otp,
      newPassword: data.password
    });
    // Redirect to login
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMethod('email')}
          className={`px-4 py-2 rounded ${method === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Email
        </button>
        <button
          onClick={() => setMethod('phone')}
          className={`px-4 py-2 rounded ${method === 'phone' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          SMS
        </button>
      </div>

      <form onSubmit={handleSubmit(step === 1 ? sendOTP : handleReset)}>
        {method === 'email' ? (
          <input
            {...register('email')}
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 mb-4 border rounded"
          />
        ) : (
          <PhoneInput
            value={watch('phone')}
            onChange={(value) => setValue('phone', value)}
          />
        )}

        {step === 2 && (
          <>
            <input
              {...register('otp')}
              placeholder="Enter OTP"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              {...register('password')}
              type="password"
              placeholder="New Password"
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 mb-4 border rounded"
            />
          </>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {step === 1 ? 'Send OTP' : 'Reset Password'}
        </button>
      </form>

      <p className="mt-4 text-center">
        Remember your password?{' '}
        <a href="/login" className="text-blue-500">Login</a>
      </p>
    </div>
  );
}