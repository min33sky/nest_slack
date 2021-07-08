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
import { UserInfo } from '@typings/user';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState } from 'react';

import { Link, Redirect } from 'react-router-dom';
import useSWR from 'swr';

/**
 * 로그인 페이지
 * /login
 * @returns
 */
export default function Login() {
  const { data: userData, mutate } = useSWR<UserInfo | boolean>('/api/users', fetcher); // ? SWR은 KEY값이 동일하면 데이터가 공유된다.
  const { value: email, handler: onChangeEmail } = useInput('');
  const { value: password, handler: onChangePassword } = useInput('');
  const [loginError, setLoginError] = useState(false);

  const onSubmit = useCallback(
    async (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoginError(false);

      if (!email || !email.trim() || !password || !password.trim()) {
        setLoginError(true);
        return;
      }

      try {
        const response = await axios.post('/api/users/login', { email, password });
        mutate(response.data, false); // ? false: 재검증 요청을 보내지 않는다. true: 재검증 요청을 보냄.
      } catch (error: unknown) {
        setLoginError(true);
      }
    },
    [email, password, mutate]
  );

  console.log('userdata: ', typeof userData, userData);

  if (userData) return <Redirect to="/workspace/sleact/channel/일반" />;

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
