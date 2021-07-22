import Modal from '@components/Modal';
import useInput from '@hooks/useInput';
import { Input } from '@pages/Signup/style';
import { Button, InputWithLabel } from '@styles/form';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
}

/**
 * 채널 초대 모달
 * @param show
 * @param onCloseModal
 * @returns Modal to invite member to channel
 */
export default function InviteChannelModal({ show, onCloseModal }: IProps) {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { value: email, handler: onChangeEmail } = useInput('');
  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { revalidate: revalidateMembers } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher
  ); // !!!! undefined 나옴 채널에서

  console.log('workspace, channel: ', workspace, channel);

  const onInviteMember = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email || !email.trim()) return;
      try {
        await axios.post(
          `/api/workspaces/${workspace}/channels/${channel}/members`,
          { email },
          { withCredentials: true }
        );

        revalidateMembers();
        onCloseModal();
        toast.success('채널 초대 성공', { position: 'bottom-center' });
      } catch (error) {
        console.dir(error);
        toast.error(error.response?.data, { position: 'bottom-center' });
      }
    },
    [channel, email, onCloseModal, revalidateMembers, workspace]
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <InputWithLabel>
          <label htmlFor="email">초대 할 회원의 이메일 주소</label>
          <Input id="email" type="email" value={email} onChange={onChangeEmail} autoFocus />
        </InputWithLabel>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  );
}
