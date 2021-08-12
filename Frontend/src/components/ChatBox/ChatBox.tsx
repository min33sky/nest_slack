import { ChatArea, MentionsTextarea, Toolbox, SendButton } from '@components/ChatBox/ChatBox.style';
import { Form } from '@pages/Signup/style';
import { IUser } from '@typings/db';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Mention } from 'react-mentions';
import autosize from 'autosize';

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

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyPress={onKeyDownChat}
          ref={textareaRef}
        />
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
