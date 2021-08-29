import { IChat, IDM } from '@typings/db';
import React from 'react';
import { useParams } from 'react-router-dom';
import gravatar from 'gravatar';
import dayjs from 'dayjs';
import { ChatWrapper } from './Chat.style';

interface IChatProps {
  data: IDM | IChat;
}

function Chat({ data }: IChatProps) {
  const { workspace } = useParams<{ workspace: string; channel: string }>();
  const user = 'Sender' in data ? data.Sender : data.User;

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm A')}</span>
        </div>
        <p>{data.content}</p>
      </div>
    </ChatWrapper>
  );
}

export default Chat;
