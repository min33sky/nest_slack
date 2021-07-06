import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Button, InputWithLabel } from '@styles/form';
import axios from 'axios';
import React, { useCallback } from 'react';
import { toast } from 'react-toastify';

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

  const onChangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      return id === 'workspace-name' ? setWorkspaceName(value) : setWorkspaceUrl(value);
    },
    [setWorkspaceName, setWorkspaceUrl]
  );

  const onCreateWorkspace = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!workspaceName || !workspaceName.trim()) return;
      if (!workspaceUrl || !workspaceUrl.trim()) return;

      try {
        await axios.post(
          '/api/workspaces',
          { name: workspaceName, url: workspaceUrl },
          { withCredentials: true }
        );

        // TODO: SWR로 상태 업데이트 하기

        setWorkspaceName('');
        setWorkspaceUrl('');
        onCloseModal();
        toast.success('워크스페이스 생성 완료 :)', { position: 'bottom-center' });
      } catch (error: any) {
        toast.error(error.response?.data.message, { position: 'bottom-center' });
      }
    },
    [workspaceName, workspaceUrl, onCloseModal, setWorkspaceUrl, setWorkspaceName]
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateWorkspace}>
        <InputWithLabel>
          <label htmlFor="workspace-name">워크스페이스 이름</label>
          <input type="text" id="workspace-name" value={workspaceName} onChange={onChangeInput} />
        </InputWithLabel>

        <InputWithLabel>
          <label htmlFor="workspace-url">워크스페이스 URL</label>
          <input type="text" id="workspace-url" value={workspaceUrl} onChange={onChangeInput} />
        </InputWithLabel>
        <Button type="submit">생성하기</Button>
      </form>
    </Modal>
  );
}
