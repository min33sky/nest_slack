import {
  ChatArea,
  MentionsTextarea,
  Toolbox,
  SendButton,
  EachMention,
} from '@components/ChatBox/ChatBox.style';
import { Form } from '@pages/Signup/style';
import { IUser, IUserWithOnline } from '@typings/db';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mention, SuggestionDataItem } from 'react-mentions';
import autosize from 'autosize';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router-dom';
import gravatar from 'gravatar';

interface IChatBox {
  chat: string;
  onChangeChat: (e: any) => void;
  onSubmitForm: (e: any) => void;
}

/**
 * 채팅 입력 컴포넌트
 * ? Enter: 메세지 전송
 * ? Shift + Enter: 아래 칸으로 이동
 * @param chat 채팅 메세지
 * @param onChangeChat 인풋 핸들러
 * @param onSubmitForm 메세지 전송
 * @returns
 */
export default function ChatBox({ chat, onChangeChat, onSubmitForm }: IChatBox) {
  const { workspace } = useParams<{ workspace: string }>();
  const { data: userData } = useSWR<IUser>(`/api/users`, fetcher); // 내 정보
  const { data: memberData } = useSWR<IUserWithOnline[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher
  ); // 현재 워크스페이스 맴버 정보

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);

  const onKeyDownChat = useCallback(
    (e: React.KeyboardEvent) => {
      // ? 그냥 엔터키만 눌렀을 시 채팅 전송
      if (e.key === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          onSubmitForm(e);
        }
      }
    },
    [onSubmitForm]
  );

  const renderSuggesion = useCallback(
    (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focused: boolean
    ): React.ReactNode => {
      if (!memberData) return;
      return (
        <EachMention focus={focused}>
          <img
            src={gravatar.url(memberData[index].email, { s: '20px', d: 'retro' })}
            alt={memberData[index].nickname}
          />
          <span>{highlightedDisplay}</span>
        </EachMention>
      );
    },
    [memberData]
  );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyPress={onKeyDownChat}
          placeholder="메세지를 입력하세요."
          inputRef={textareaRef}
          allowSuggestionsAboveCursor
        >
          <Mention
            appendSpaceOnAdd
            trigger="@"
            data={memberData?.map((member) => ({ id: member.id, display: member.nickname })) || []}
            renderSuggestion={renderSuggesion}
          />
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={`c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send${
              chat?.trim() ? '' : ' c-texty_input__button--disabled'
            }`}
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
}
