import Chat from '@components/Chat/Chat';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/style';
import { IChat, IDM } from '@typings/db';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { useCallback, useRef } from 'react';

interface IChatList {
  chatData?: IDM[] | IChat[];
}

export default function ChatList({ chatData }: IChatList) {
  const scrollbarRef = useRef(null);

  const onScroll = useCallback(() => {}, []);

  if (!chatData) return null;

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        {chatData?.map((chat) => (
          <Chat key={chat.id} data={chat} />
        ))}
      </Scrollbars>
    </ChatZone>
  );
}
