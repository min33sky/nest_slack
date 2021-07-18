import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

export default function ChannelList() {
  const { workspace } = useParams<{ workspace: string }>();
  const { data: userData, revalidate } = useSWR<IUser & boolean>('/api/users', fetcher); // ? SWR은 KEY값이 동일하면 데이터가 공유된다.

  // 채널 정보 가져오기
  const { data: channelData } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher
  );

  return (
    <>{channelData && channelData.map((channel) => <div key={channel.id}>{channel.name}</div>)}</>
  );
}
