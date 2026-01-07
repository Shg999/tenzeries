import { configureStore } from '@reduxjs/toolkit';
import tenziesReducer from './tenziesSlice';

export const store = configureStore({
  reducer:{
    tenzies: tenziesReducer
  }
})