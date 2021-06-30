import useInput from '@hooks/useInput';
import axios, { AxiosError } from 'axios';
import React, { useState, useCallback } from 'react';

import { Link } from 'react-router-dom';
import {
  Button,
  Container,
  ErrorMessage,
  Form,
  Input,
  Label,
  LinkContainer,
  Success,
} from './style';

/**
 * 회원가입 페이지
 * /signup
 * @returns page for sign-up
 */
export default function Signup() {
  const { value: email, handler: onChangeEmail } = useInput('');
  const { value: nickname, handler: onChangeNickname } = useInput('');
  const { value: password, setValue: setPassword } = useInput('');
  const { value: passwordCheck, setValue: setPasswordCheck } = useInput('');
  const [mismatchError, setMismatchError] = useState(false); // 패스워드 일치 여부
  const [signUpErrorMessage, setSignUpErrorMessage] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [isValid, setIsValid] = useState(true); // 폼 유효성 상태

  /**
   * 패스워드 입력 및 검증 핸들러
   */
  const onChangePasswordAndCheck = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const currentInput = e.target.name;
      if (currentInput === 'password') {
        setPassword(e.target.value);
        setMismatchError(!!passwordCheck && e.target.value !== passwordCheck);
      } else {
        setPasswordCheck(e.target.value);
        setMismatchError(password !== e.target.value);
      }
    },
    [password, passwordCheck, setPassword, setPasswordCheck]
  );

  /**
   * 회원 가입 핸들러
   */
  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSignUpErrorMessage('');
      setSignUpSuccess(false);
      setIsValid(true);

      if (
        !email ||
        !email.trim() ||
        !nickname ||
        !nickname.trim() ||
        !password ||
        !password.trim() ||
        !passwordCheck ||
        !passwordCheck.trim()
      ) {
        setIsValid(false);
        return;
      }

      if (!mismatchError) {
        axios
          .post('/api/users', {
            email,
            nickname,
            password,
          })
          .then((_response) => {
            setSignUpSuccess(true);
            // TODO: 바로 로그인 요청을 보내자.
          })
          .catch((error: AxiosError) => {
            setSignUpErrorMessage(error.response?.data.message);
          })
          .finally(() => {});
      }
    },
    [email, mismatchError, nickname, password, passwordCheck]
  );

  return (
    <Container>
      <header>SLACK</header>

      <Form onSubmit={onSubmit}>
        <Label>
          <label htmlFor="email">이메일 주소</label>
          <Input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={onChangeEmail}
            autoFocus
          />
          {!isValid && !email && <ErrorMessage>이메일을 입력해주세요.</ErrorMessage>}
        </Label>

        <Label>
          <label htmlFor="nickname">닉네임</label>
          <Input
            type="text"
            name="nickname"
            id="nickname"
            value={nickname}
            onChange={onChangeNickname}
          />
          {!isValid && !nickname && <ErrorMessage>닉네임을 입력해주세요.</ErrorMessage>}
        </Label>

        <Label>
          <label htmlFor="password">비밀번호</label>
          <Input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={onChangePasswordAndCheck}
            placeholder={isValid ? '비밀번호를 입력하세요' : '비밀번호 오류'}
          />
          {!isValid && !password && <ErrorMessage>비밀번호를 입력해주세요.</ErrorMessage>}
        </Label>

        <Label>
          <label htmlFor="passwordCheck">비밀번호 확인</label>
          <div>
            <Input
              type="password"
              name="passwordCheck"
              id="passwordCheck"
              value={passwordCheck}
              onChange={onChangePasswordAndCheck}
            />
            {!isValid && !passwordCheck && (
              <ErrorMessage>비밀번호 확인을 입력해주세요.</ErrorMessage>
            )}
            {mismatchError && <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>}
            {signUpErrorMessage && <ErrorMessage>{signUpErrorMessage}</ErrorMessage>}
            {signUpSuccess && <Success>회원가입 완료! 로그인해주세요.</Success>}
          </div>
        </Label>

        <Button type="submit">회원 가입</Button>
      </Form>

      <LinkContainer>
        이미 회원이신가요? <Link to="/login">로그인 하러 가기</Link>
      </LinkContainer>
    </Container>
  );
}
