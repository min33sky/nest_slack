import ChatBox from '@components/ChatBox/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import { Container, Header } from '@pages/Channel/Channel.style';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React from 'react';
import { useParams } from 'react-router';
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

  const { value: chat, handler: onChangeChat } = useInput('');

  console.log('채널 데이터: ', channelData);

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
      />

      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={() => {}} />

      {/* 채널 초대 모달이 들어올 자리 */}
    </Container>
  );
}
