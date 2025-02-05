import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import OTPInput from '../../components/auth/OTPInput';
import GoogleButton from '../../components/auth/GoogleButton';
import CompleteProfileModal from '../../components/auth/CompleteProfileModal';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';


export default function Login() {
  const [method, setMethod] = useState('password');
  const [otpSent, setOtpSent] = useState(false);
  const { register, handleSubmit, watch } = useForm();

  const onSubmit = async (data) => {
    try {
      if (method === 'password') {
        const response = await api.post('/auth/login/password', {
          identifier: data.identifier,
          password: data.password
        });
        // Handle login success
      } else {
        if (!otpSent) {
          await api.post('/auth/login/otp-request', {
            [method === 'email-otp' ? 'email' : 'phone']: data.identifier
          });
          setOtpSent(true);
        } else {
          const response = await api.post('/auth/login/otp-verify', {
            [method === 'email-otp' ? 'email' : 'phone']: data.identifier,
            otp: data.otp
          });
          // Handle login success
        }
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex gap-4 mb-6">
        {['password', 'email-otp', 'phone-otp'].map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`px-4 py-2 rounded ${
              method === m ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {m.replace('-', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('identifier')}
          placeholder={
            method === 'phone-otp' ? 'Phone number' : 
            method === 'email-otp' ? 'Email' : 'Email/Username'
          }
          className="w-full p-2 mb-4 border rounded"
        />

        {method === 'password' && (
          <input
            {...register('password')}
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
          />
        )}

        {method.includes('otp') && otpSent && (
          <input
            {...register('otp')}
            placeholder="Enter OTP"
            className="w-full p-2 mb-4 border rounded"
          />
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {otpSent ? 'Verify OTP' : method === 'password' ? 'Login' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}