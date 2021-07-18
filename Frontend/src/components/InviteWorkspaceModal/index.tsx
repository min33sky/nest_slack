import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Input } from '@pages/Signup/style';
import { Button, InputWithLabel } from '@styles/form';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
}

/**
 * 워크스페이스에 회원 초대 모달
 * @param show
 * @param onCloseModal
 * @returns Modal to invite member to workspace
 */
export default function InviteWorkspaceModal({ show, onCloseModal }: IProps) {
  const { workspace } = useParams<{ workspace: string }>();
  const { value: email, handler: onChangeEmail } = useInput('');

  const { data: userData } = useSWR<IUser>('/api/users', fetcher); // 로그인 한 유저 정보
  const { revalidate: revalidateMember } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher
  ); // 현재 워크스페이스 인원들 정보

  const onInviteMember = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email || !email.trim()) return;

      try {
        await axios.post(
          `/api/workspaces/${workspace}/members`,
          {
            email,
          },
          {
            withCredentials: true,
          }
        );

        revalidateMember();
        // ? setEmail도 초기화해야되나??
        onCloseModal();
        toast.success('회원 초대 성공!', { position: 'bottom-center' });
      } catch (error) {
        console.dir(error);
        toast.error(error.response?.data, { position: 'bottom-center' });
      }
    },
    [email, onCloseModal, revalidateMember, workspace]
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <InputWithLabel>
          <label htmlFor="member">이메일</label>
          <Input id="member" type="email" value={email} onChange={onChangeEmail} autoFocus />
        </InputWithLabel>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
}
