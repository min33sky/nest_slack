import React from 'react';
import App from '@layouts/App';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
// ? 리액트 토스트 관련
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// ? SWR Devtools 관련
import SWRDevtools from '@jjordy/swr-devtools';
import { cache, mutate } from 'swr';

render(
  <BrowserRouter>
    <SWRDevtools cache={cache} mutate={mutate} />
    <App />
    <ToastContainer />
  </BrowserRouter>,
  document.querySelector('#app')
);
