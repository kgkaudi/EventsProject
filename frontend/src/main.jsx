import { Provider } from "react-redux";
import { store } from "./store/store";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router";
import {Toaster} from "react-hot-toast";
import { AuthContextProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthContextProvider>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </AuthContextProvider>
  </Provider>
)
