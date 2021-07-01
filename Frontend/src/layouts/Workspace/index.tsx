import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback } from 'react';
import { Redirect } from 'react-router-dom';
import useSWR from 'swr';

interface IProps {
  children: React.ReactNode;
}

export default function Workspace({ children }: IProps) {
  const { data: userData, revalidate } = useSWR<{ email: string; id: number; nickname: string }>(
    '/api/users',
    fetcher
  ); // ? SWR은 KEY값이 동일하면 데이터가 공유된다.

  const onLogout = useCallback(() => {
    axios.post('/api/users/logout', {}, { withCredentials: true }).then(() => {
      revalidate();
    });
  }, [revalidate]);

  if (!userData) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <button type="button" onClick={onLogout}>
        로그아웃
      </button>
      {children}
    </div>
  );
}
