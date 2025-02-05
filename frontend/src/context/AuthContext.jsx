// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logoutSuccess } from '../redux/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/check');
        dispatch(loginSuccess(response.data.user));
      } catch (error) {
        dispatch(logoutSuccess());
      }
    };
    checkAuth();
  }, [dispatch]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};