import useSocket from '@hooks/useSocket';
import { IUser, IUserWithOnline } from '@typings/db';
import fetcher from '@utils/fetcher';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';

import useSWR from 'swr';
import { CollapseButton } from './style';

/**
 * 다이렉트 메세지를 보낼수 있는 명단 리스트
 * @returns
 */
export default function DMList() {
  const { workspace } = useParams<{ workspace: string }>();
  const [socket] = useSocket(workspace);

  const [onlineList, setOnlineList] = useState<number[]>([]); //* 현 workspace의 접속자 명단

  const { data: userData } = useSWR<IUser>(`/api/users`, fetcher); // 내 정보
  const { data: memberData } = useSWR<IUserWithOnline[]>(
    userData ? `/api/workspaces/${workspace}/members` : null,
    fetcher
  ); // 현재 워크스페이스 맴버 정보

  const [channelCollapse, setChannelCollapse] = useState(false);

  const toggleChannelCollapse = useCallback(() => {
    setChannelCollapse((prev) => !prev);
  }, []);

  useEffect(() => {
    socket?.on('onlineList', (data: number[]) => {
      setOnlineList(data);
    });
    return () => {
      socket?.off('onlineList');
    };
  }, [socket]);

  return (
    <>
      <h2>
        <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
          <i
            className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
            data-qa="channel-section-collapse"
            aria-hidden="true"
          />
        </CollapseButton>
        <span>Direct Messages</span>
      </h2>

      <div>
        {!channelCollapse &&
          memberData?.map((member) => {
            const isOnline = onlineList.includes(member.id);
            return (
              <NavLink
                key={member.id}
                activeClassName="selected"
                to={`/workspace/${workspace}/dm/${member.id}`}
                onClick={() => {}}
              >
                <i
                  className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                    isOnline
                      ? 'c-presence--active c-icon--presence-online'
                      : 'c-icon--presence-offline'
                  }`}
                  aria-hidden="true"
                  data-qa="presence_indicator"
                  data-qa-presence-self="false"
                  data-qa-presence-active="false"
                  data-qa-presence-dnd="false"
                />
                <span>{member.nickname}</span>
                {member.id === userData?.id && <span>[나]</span>}
              </NavLink>
            );
          })}
      </div>
    </>
  );
}
