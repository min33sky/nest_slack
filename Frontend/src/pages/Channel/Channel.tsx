import ChatBox from '@components/ChatBox/ChatBox';
import ChatList from '@components/ChatList/ChatList';
import useInput from '@hooks/useInput';
import { Container, Header } from '@pages/Channel/Channel.style';
import { IChannel, IChat, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import useSWR from 'swr';

const PAGE_SIZE = 20;

/**
 * 채널 채팅 컴포넌트
 * @returns
 */
export default function Channel() {
  const { channel, workspace } = useParams<{ workspace: string; channel: string }>();
  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { data: channelData } = useSWR<IChannel[]>(`/api/workspaces/${workspace}/channels`);

  const {
    data: chatData,
    mutate: mutateChat,
    revalidate,
  } = useSWR<IChat[]>(
    `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=${PAGE_SIZE}&page=1`,
    fetcher
  );

  const { value: chat, handler: onChangeChat, setValue: setValueChat } = useInput('');

  console.log('채널 데이터: ', channelData);
  console.log('채팅 데이터: ', chatData);

  const onSubmitForm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      axios
        .post(
          `/api/workspaces/${workspace}/channels/${channel}/chats`,
          {
            content: chat,
          },
          {
            withCredentials: true,
          }
        )
        .then(() => {
          // TODO: 필요 없을 수도
          setValueChat('');
          console.log('[Channel] revalidate()');
          revalidate();
        })
        .catch(console.error);
    },
    [channel, chat, revalidate, workspace, setValueChat]
  );

  return (
    <Container>
      <Header>
        <span>#채널이름</span>
        <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* <span>{channelMembersData?.length}</span> */}
          <button
            // onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i
              className="c-icon p-ia__view_header__button_icon c-icon--add-user"
              aria-hidden="true"
            />
          </button>
        </div>
      </Header>

      <ChatList
        // scrollbarRef={scrollbarRef}
        // isReachingEnd={isReachingEnd}
        // isEmpty={isEmpty}
        // chatSections={chatSections}
        // setSize={setSize}
        chatData={chatData}
      />

      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />

      {/* 채널 초대 모달이 들어올 자리 */}
    </Container>
  );
}
