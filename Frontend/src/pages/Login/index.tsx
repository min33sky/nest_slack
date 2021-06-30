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
import axios, { AxiosError } from 'axios';
import React, { useCallback, useState } from 'react';

import { Link } from 'react-router-dom';

export default function Login() {
  const { value: email, handler: onChangeEmail } = useInput('');
  const { value: password, handler: onChangePassword } = useInput('');
  const [loginError, setLoginError] = useState(false);

  const onSubmit = useCallback(
    (e: React.ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoginError(false);

      // ? 인풋 검증하기
      // if (!email || !email.trim() || !password || !password.trim()) {
      //   setLoginError(true);
      //   return;
      // }

      // ? 로그인 작업
      axios
        .post('/api/users/login', { email, password })
        .then((response) => {
          console.log('로그인 성공');
        })
        .catch((error: AxiosError) => {
          console.log(error.response);
          setLoginError(true);
        });

      console.log('로그인');
    },
    [email, password]
  );

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
