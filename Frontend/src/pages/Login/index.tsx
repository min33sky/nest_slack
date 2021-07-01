import useInput from '@hooks/useInput';
import {
  Button,
  Container,
  ErrorMessage,
  Form,
  Input,
  Label,
  LinkContainer,
} from '@pages/Signup/style';
import fetcher from '@utils/fetcher';
import axios, { AxiosError } from 'axios';
import React, { useCallback, useState } from 'react';

import { Link, Redirect } from 'react-router-dom';
import useSWR from 'swr';

export default function Login() {
  const { data: userData, revalidate } = useSWR<{ email: string; id: number; nickname: string }>(
    '/api/users',
    fetcher
  ); // ? SWR은 KEY값이 동일하면 데이터가 공유된다.
  const { value: email, handler: onChangeEmail } = useInput('');
  const { value: password, handler: onChangePassword } = useInput('');
  const [loginError, setLoginError] = useState(false);

  const onSubmit = useCallback(
    (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoginError(false);

      if (!email || !email.trim() || !password || !password.trim()) {
        setLoginError(true);
        return;
      }

      axios
        .post('/api/users/login', { email, password })
        .then((_response) => {
          revalidate();
        })
        .catch((_error: AxiosError) => {
          setLoginError(true);
        });
    },
    [email, password, revalidate]
  );

  if (userData) return <Redirect to="/workspace/channel" />;

  return (
    <Container>
      <header>Slack</header>

      <Form onSubmit={onSubmit}>
        <Label>
          <label htmlFor="email">이메일</label>
          <Input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={onChangeEmail}
            autoFocus
          />
        </Label>

        <Label>
          <label htmlFor="password">패스워드</label>
          <Input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={onChangePassword}
          />
          {loginError && <ErrorMessage>로그인 실패</ErrorMessage>}
        </Label>

        <Button>로그인</Button>
      </Form>

      <LinkContainer>
        아직 회원이 아니신가요? <Link to="/signup">회원 가입</Link>
      </LinkContainer>
    </Container>
  );
}
