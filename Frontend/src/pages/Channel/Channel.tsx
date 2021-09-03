import ChatBox from '@components/ChatBox/ChatBox';
import ChatList from '@components/ChatList/ChatList';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { Container, Header } from '@pages/Channel/Channel.style';
import { IChannel, IChat, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import axios from 'axios';
import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useParams } from 'react-router-dom';

import useSWR, { useSWRInfinite } from 'swr';

const PAGE_SIZE = 20;

/**
 * 채널 채팅 패아자
 * @returns
 */
export default function Channel() {
  const { channel, workspace } = useParams<{ workspace: string; channel: string }>();
  const scrollbarRef = useRef<Scrollbars>(null);
  const [socket] = useSocket(workspace);
  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { data: channelsData } = useSWR<IChannel[]>(
    `/api/workspaces/${workspace}/channels`,
    fetcher
  );
  const channelData = channelsData?.find((v) => v.name === channel);
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) =>
      `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=${PAGE_SIZE}&page=${
        index + 1
      }`,
    fetcher,
    {
      onSuccess(data) {
        if (data?.length === 1) {
          setTimeout(() => {
            scrollbarRef.current?.scrollToBottom();
          }, 100);
        }
      },
    }
  );

  const { value: chat, handler: onChangeChat, setValue: setChat } = useInput('');

  const isEmpty = chatData?.[0].length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE); // ? 마지막 데이터인지 확인

  console.log('채널 데이터: ', channelData);
  console.log('채팅 데이터: ', chatData);

  const onSubmitForm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (chat?.trim() && chatData && channelData && userData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: userData.id,
            User: userData,
            createdAt: new Date(),
            ChannelId: channelData.id,
            Channel: channelData,
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          if (scrollbarRef.current) {
            console.log('scrollToBottom!', scrollbarRef.current?.getValues());
            scrollbarRef.current.scrollToBottom();
          }
        });
        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
            content: savedChat,
          })
          .catch(console.error);
      }
    },
    [channel, chat, workspace, setChat, channelData, chatData, mutateChat, userData]
  );

  const onMessage = useCallback((data) => {
    console.log('온 메세지: ', data);
  }, []);

  useEffect(() => {
    socket?.on('message', onMessage);
    return () => {
      socket?.off('message', onMessage);
    };
  }, [socket, onMessage]);

  console.log('채널 소켓 주소: ', socket);

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

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
        ref={scrollbarRef}
        isReachingEnd={!!isReachingEnd}
        isEmpty={isEmpty}
        chatSections={chatSections}
        setSize={setSize}
      />

      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />

      {/* 채널 초대 모달이 들어올 자리 */}
    </Container>
  );
}
