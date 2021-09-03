import { Container, Header } from '@pages/DirectMessage/DirectMessage.style';
import { IDM, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { MutableRefObject, useCallback, useEffect, useRef } from 'react';
import useSWR, { useSWRInfinite } from 'swr';
import gravatar from 'gravatar';
import ChatBox from '@components/ChatBox/ChatBox';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import makeSection from '@utils/makeSection';
import ChatList from '@components/ChatList/ChatList';
import Scrollbars from 'react-custom-scrollbars';

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
  const scrollbarRef: MutableRefObject<Scrollbars | null> = useRef(null);

  const {
    data: chatData,
    mutate: mutateChat,
    revalidate,
    setSize,
  } = useSWRInfinite<IDM[]>(
    (index: number) =>
      `/api/workspaces/${workspace}/dms/${id}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
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

  const isEmpty = chatData?.[0].length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < PAGE_SIZE); // ? 마지막 데이터인지 확인

  console.log('DM chat data: ', chatData);
  console.log('Socket: ', socket);

  const { value: chat, handler: onChangeChat, setValue: setChat } = useInput('');

  const onMessage = useCallback(
    (data: IDM) => {
      if (data.SenderId === Number(id) && myData?.id !== Number(id)) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getClientHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              console.log('scrollToBottom!', scrollbarRef.current.getValues());
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 100);
            }
          }
        });
      }
    },
    [id, mutateChat, myData]
  );

  //* 로딩 시 스크롤바 제일 아래로 이동
  useEffect(() => {
    // ? 제일 처음에 채팅 데이터를 불러왔을 때만 스크롤바를 제일 아래로 내린다.
    if (chatData && chatData.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  useEffect(() => {
    socket?.on('test', (data: any) => {
      console.log('테스트용: ', data);
    });
    return () => {
      socket?.off('test');
    };
  }, [socket]);

  const onSubmitForm = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      //* Optimistic UI 적용
      if (chat.trim() && chatData && myData && userData) {
        const savedChat = chat;
        // 1. 화면을 미리 업데이트 한다.
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0].id || 0) + 1,
            content: savedChat,
            SenderId: myData?.id,
            Sender: myData,
            ReceiverId: userData?.id,
            Receiver: userData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom();
        });

        // 2. 서버로 데이터를 전송한다.
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
      }
    },
    [chat, id, revalidate, workspace, setChat, chatData, mutateChat, myData, userData]
  );

  if (!myData || !userData) {
    return <Container>로딩 중............................</Container>;
  }

  // ? flat(): 2차원 배열을 1차원 배열로 변경해서 리턴한다. (immutable)
  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []);

  return (
    <Container>
      <Header>
        <img
          src={gravatar.url(userData.email, { s: '24px', d: 'retro' })}
          alt={userData.nickname}
        />
        <span>{userData.nickname}</span>
      </Header>

      <ChatList
        chatSections={chatSections}
        ref={scrollbarRef}
        isEmpty={isEmpty}
        isReachingEnd={!!isReachingEnd}
        setSize={setSize}
      />

      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
}
