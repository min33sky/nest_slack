import { Container, Header } from '@pages/DirectMessage/DirectMessage.style';
import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback } from 'react';
import useSWR from 'swr';
import gravatar from 'gravatar';
import ChatBox from '@components/ChatBox/ChatBox';
import ChatList from '@components/ChatList/ChatList';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PAGE_SIZE = 20;

/**
 * DM 페이지
 * @returns
 */
export default function DirectMessage() {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const [socket] = useSocket(workspace);
  const { data: myData } = useSWR<IUser>('/api/users', fetcher); // 내 정보
  const { data: userData } = useSWR<IUser>(`/api/workspaces/${workspace}/members/${id}`, fetcher); // 상대방 정보

  const {
    data: chatData,
    mutate: mutateChat,
    revalidate,
  } = useSWR<IDM[]>(
    `/api/workspaces/${workspace}/dms/${id}/chats?perPage=${PAGE_SIZE}&page=1`,
    fetcher
  );

  console.log('DM chat data: ', chatData);

  const { value: chat, handler: onChangeChat, setValue } = useInput('');

  const onSubmitForm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      axios
        .post(
          `/api/workspaces/${workspace}/dms/${id}/chats`,
          {
            content: chat,
          },
          {
            withCredentials: true,
          }
        )
        .then(() => {
          console.log('[DMLIST] revalidate()');
          revalidate();
        })
        .catch(console.error);
    },
    [chat, id, revalidate, workspace]
  );

  if (!myData || !userData) {
    return <Container>로딩 중............................</Container>;
  }

  return (
    <Container>
      <Header>
        <img
          src={gravatar.url(userData.email, { s: '24px', d: 'retro' })}
          alt={userData.nickname}
        />
        <span>{userData.nickname}</span>
      </Header>

      <ChatList chatData={chatData} />

      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
}
