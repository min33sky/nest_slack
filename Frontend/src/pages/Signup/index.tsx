import useInput from '@hooks/useInput';
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
  // const [formValidation, setFormValidation] = useState(true); //? 최종 폼 검증에 사용할 상태값

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
  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('회원 가입');
  }, []);

  return (
    <Container>
      <header>SLACK</header>

      <Form onSubmit={onSubmit}>
        <Label>
          <span>이메일 주소</span>
          <Input type="email" name="email" id="email" value={email} onChange={onChangeEmail} />
        </Label>

        <Label>
          <span>닉네임</span>
          <Input
            type="text"
            name="nickname"
            id="nickname"
            value={nickname}
            onChange={onChangeNickname}
          />
        </Label>

        <Label>
          <span>비밀번호</span>
          <Input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={onChangePasswordAndCheck}
          />
        </Label>

        <Label>
          <span>비밀번호 확인</span>
          <div>
            <Input
              type="password"
              name="passwordCheck"
              id="passwordCheck"
              value={passwordCheck}
              onChange={onChangePasswordAndCheck}
            />
            {!nickname && <ErrorMessage>닉네임을 입력해주세요.</ErrorMessage>}
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
