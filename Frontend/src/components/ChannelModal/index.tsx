import Modal from '@components/Modal';
import { Button, InputWithLabel } from '@styles/form';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface IProps {
  show: boolean;
  onCloseModal: () => void;
}

export default function ChannelModal({ show, onCloseModal }: IProps) {
  const { workspace } = useParams<{ workspace: string }>();
  const [channelName, setChannelName] = useState('');
  const { data: userData } = useSWR('/api/users', fetcher);
  const { revalidate: revalidateChannel } = useSWR(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher
  );

  const onCreateChannel = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!channelName || !channelName.trim()) return;

      try {
        await axios.post(
          `/api/workspaces/${workspace}/channels`,
          {
            name: channelName,
          },
          { withCredentials: true }
        );

        revalidateChannel();
        setChannelName('');
        onCloseModal();
        toast.success('채널 생성 완료', { position: 'bottom-center' });
      } catch (error) {
        console.error('error:', error);
        toast.error(error.response?.data.message, { position: 'bottom-center' });
      }
    },
    [channelName, onCloseModal, workspace, revalidateChannel]
  );

  const onChangeName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setChannelName(e.target.value);
  }, []);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <InputWithLabel>
          <label htmlFor="channel-name">채널</label>
          <input id="channel-name" value={channelName} onChange={onChangeName} />
        </InputWithLabel>
        <Button type="submit" onClick={() => {}}>
          생성
        </Button>
      </form>
    </Modal>
  );
}
