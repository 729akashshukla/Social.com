import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logoutSuccess(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
    // Add these cases to existing slice
    extraReducers: (builder) => {
    builder.addCase(completeProfile.fulfilled, (state, action) => {
      state.user = action.payload;
      state.registrationComplete = true;
    });
  }
  }
});


export const { loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;