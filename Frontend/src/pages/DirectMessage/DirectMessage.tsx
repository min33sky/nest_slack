import { Container, Header } from '@pages/DirectMessage/DirectMessage.style';
import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import gravatar from 'gravatar';
import ChatBox from '@components/ChatBox/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';

/**
 * DM 페이지
 * @returns
 */
export default function DirectMessage() {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: myData } = useSWR<IUser>('/api/users', fetcher); // 내 정보
  const { data: theOtherPersonData } = useSWR<IUser>(
    `/api/workspaces/${workspace}/members/${id}`,
    fetcher
  ); // 상대방 정보

  const { value: chat, handler: onChangeChat, setValue } = useInput('');

  const onSubmitForm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log('채팅 전송~~~~[구현중]');
      setValue('');
    },
    [setValue]
  );

  if (!myData || !theOtherPersonData) {
    return <Container>로딩 중............................</Container>;
  }

  return (
    <Container>
      <Header>
        <img
          src={gravatar.url(theOtherPersonData.email, { s: '24px', d: 'retro' })}
          alt={theOtherPersonData.nickname}
        />
        <span>{theOtherPersonData.nickname}</span>
      </Header>

      <ChatList />

      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
}
