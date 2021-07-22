import { ChatArea, MentionsTextarea, Toolbox, SendButton } from '@components/ChatBox/style';
import { Form } from '@pages/Signup/style';
import { IUser } from '@typings/db';
import React, { useState } from 'react';
import { Mention } from 'react-mentions';

export default function ChatBox() {
  const [chat, setChat] = useState('임시 메세지'); // ? 임시

  return (
    <ChatArea>
      <Form onSubmit={() => {}}>
        <MentionsTextarea />
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
