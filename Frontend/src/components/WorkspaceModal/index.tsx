import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, InputWithLabel } from '@styles/form';
import React, { useCallback } from 'react';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
}

/**
 * 워크스페이스 생성 모달
 * @param show
 * @param onCloseModal
 * @returns Modal to create workspace
 */
export default function WorkspaceModal({ show, onCloseModal }: IProps) {
  const { value: workspaceName, setValue: setWorkspaceName } = useInput('');
  const { value: workspaceUrl, setValue: setWorkspaceUrl } = useInput('');

  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id } = e.target;
    console.log('id: ', id);
  }, []);

  const onCreateWorkspace = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('워크스페이스 등록하기');
  }, []);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateWorkspace}>
        <InputWithLabel>
          <label htmlFor="workspace-name">워크스페이스 이름</label>
          <input type="text" id="workspace-name" value={workspaceName} onChange={() => {}} />
        </InputWithLabel>

        <InputWithLabel>
          <label htmlFor="workspace-url">워크스페이스 URL</label>
          <input type="text" id="workspace-url" value={workspaceUrl} onChange={() => {}} />
        </InputWithLabel>
      </form>
      <Button type="submit">생성하기</Button>
    </Modal>
  );
}
