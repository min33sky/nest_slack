import React from 'react';
import App from '@layouts/App';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

render(
  <BrowserRouter>
    <App />
    <ToastContainer />
  </BrowserRouter>,
  document.querySelector('#app')
);
