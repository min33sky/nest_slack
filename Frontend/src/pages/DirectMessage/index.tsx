import { Container, Header } from '@pages/DirectMessage/style';
import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React from 'react';
import { useParams } from 'react-router';
import useSWR from 'swr';
import gravatar from 'gravatar';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';

export default function DirectMessage() {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: myData } = useSWR<IUser>('/api/users', fetcher); // 내 정보
  const { data: theOtherPersonData } = useSWR<IUser>(
    `/api/workspaces/${workspace}/members/${id}`,
    fetcher
  ); // 상대방 정보

  if (!myData || !theOtherPersonData) {
    return <div>로딩 중............................</div>;
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
      <ChatBox />
    </Container>
  );
}
