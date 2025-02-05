import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../utils/api';

export default function Register() {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, watch } = useForm();
  const email = watch('email');

  const sendOTP = async () => {
    await api.post('/auth/start-registration', { email });
    setStep(2);
  };

  const completeRegistration = async (data) => {
    await api.post('/auth/complete-registration', data);
    // Handle successful registration
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      {step === 1 && (
        <form onSubmit={handleSubmit(sendOTP)}>
          {/* Basic Fields */}
          <input
            {...register('email')}
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
          />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Send OTP
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(completeRegistration)}>
          {/* OTP Field */}
          <input
            {...register('otp')}
            type="text"
            placeholder="Enter OTP"
            className="w-full p-2 mb-4 border rounded"
          />

          {/* Additional Fields */}
          <input
            {...register('firstName')}
            placeholder="First Name"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            {...register('lastName')}
            placeholder="Last Name (Optional)"
            className="w-full p-2 mb-4 border rounded"
          />
          {/* Add other fields */}

          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
            Complete Registration
          </button>
        </form>
      )}

      <div className="mt-4 text-center">
        <p className="text-gray-600">Or sign up with</p>
        <GoogleButton />
      </div>
    </div>
  );
}