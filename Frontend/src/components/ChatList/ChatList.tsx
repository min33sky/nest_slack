import Chat from '@components/Chat/Chat';
import { ChatZone, Section, StickyHeader } from '@components/ChatList/style';
import { IChat, IDM } from '@typings/db';
import { positionValues, Scrollbars } from 'react-custom-scrollbars';
import React, { MutableRefObject, useCallback, useRef } from 'react';

interface IChatList {
  chatSections: { [key: string]: IDM[] };
  isEmpty: boolean;
  isReachingEnd: boolean;
  // eslint-disable-next-line no-shadow
  setSize: (size: number | ((size: number) => number)) => Promise<IDM[][] | undefined>;
}

/**
 * 채팅 메시지 리스트 컴포넌트
 */
const ChatList = React.forwardRef<Scrollbars, IChatList>(
  ({ chatSections, setSize, isEmpty, isReachingEnd }, scrollRef) => {
    const onScroll = useCallback(
      (values: positionValues) => {
        if (values.scrollTop === 0 && !isReachingEnd) {
          console.log('가장 위~~~~');
          setSize((prevSize) => prevSize + 1).then(() => {
            //* 스크롤 위치 유지
            const { current } = scrollRef as MutableRefObject<Scrollbars>;
            if (current) {
              current.scrollTop(current.getScrollHeight() - values.scrollHeight);
            }
          });
        }
      },
      [isReachingEnd, setSize, scrollRef]
    );

    return (
      <ChatZone>
        <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
          {Object.entries(chatSections).map(([date, chats], index) => {
            return (
              <Section key={date}>
                <StickyHeader>
                  <button type="button">{date}</button>
                </StickyHeader>
                {chats.map((chat) => (
                  <Chat key={chat.id} data={chat} />
                ))}
              </Section>
            );
          })}
        </Scrollbars>
      </ChatZone>
    );
  }
);

export default ChatList;
