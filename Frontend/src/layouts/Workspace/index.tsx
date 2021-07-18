import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Link, Redirect, Route, Switch, useParams } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';
import Menu from '@components/Menu';
import loadable from '@loadable/component';
import { IChannel, IUser } from '@typings/db';
import WorkspaceModal from '@components/WorkspaceModal';
import ChannelModal from '@components/ChannelModal';
import ChannelList from '@components/ChannelList';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import {
  AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceMenu,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from './style';

const Channel = loadable(() => import('@pages/Channel'));

/**
 * 워크스페이스 레이아웃 [로그인 후 볼 수 있는 레이아웃]
 * @returns Layout Component
 */
export default function Workspace() {
  const { workspace } = useParams<{ workspace: string }>();

  // TODO: 타입 좀 손 봐야함
  const { data: userData, revalidate } = useSWR<IUser & boolean>('/api/users', fetcher); // ? SWR은 KEY값이 동일하면 데이터가 공유된다.
  const { revalidate: revalidateChannel } = useSWR(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher
  );

  // 채널 정보 가져오기
  const { data: channelData } = useSWR<IChannel[]>(
    userData ? `/api/workspaces/${workspace}/channels` : null,
    fetcher
  );

  const [showUserMenu, setShowUserMenu] = useState(false); // 헤더의 사용자 메뉴
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false); // 워크스페이스 생성 모달
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false); // 채널 생성 모달
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);

  const onClickUserProfile = useCallback(() => {
    setShowUserMenu((prev) => !prev);
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onLogout = useCallback(() => {
    axios.post('/api/users/logout', {}, { withCredentials: true }).then(() => {
      // TODO: mutate로 즉시 반영하는게 나을듯
      revalidate();
      // mutate();
    });
  }, [revalidate]);

  const toggleWorkspaceMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWorkspaceMenu((prev) => !prev);
  }, []);

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspaceModal(false);
  }, []);

  // console.log('workspace: ', userData);

  if (!userData) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <Header>
        <RightMenu>
          <div role="presentation" onClick={onClickUserProfile}>
            <ProfileImg
              src={gravatar.url(userData.email, {
                s: '28x',
                d: 'retro',
              })}
              alt={userData.nickname}
            />
          </div>
          {showUserMenu && (
            <Menu
              style={{ right: 0, top: 38 }}
              show={showUserMenu}
              onCloseModal={onClickUserProfile}
            >
              <ProfileModal>
                <img
                  src={gravatar.url(userData.email, {
                    s: '36px',
                    d: 'retro',
                  })}
                  alt={userData.nickname}
                />
                <div>
                  <span id="profile-name">{userData.nickname}</span>
                  <span id="profile-active">Active</span>
                </div>
              </ProfileModal>
              <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
            </Menu>
          )}
        </RightMenu>
      </Header>

      <WorkspaceWrapper>
        {/* 워크스페이스 선택 화면 */}
        <Workspaces>
          {userData?.Workspaces?.map((ws) => (
            <Link key={ws.id} to={`/workspace/${ws.url}/channel/일반`}>
              <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
            </Link>
          ))}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>

        {/* 채널 선택 화면 */}
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceMenu}>Slack</WorkspaceName>
          <MenuScroll>
            <Menu
              show={showWorkspaceMenu}
              onCloseModal={toggleWorkspaceMenu}
              style={{ top: 95, left: 80 }}
              closeButton
            >
              {/* 메뉴 내용 */}
              <WorkspaceMenu>
                <h2>Slack</h2>
                <button type="button" onClick={onClickInviteWorkspace}>
                  워크스페이스에 사용자 초대
                </button>
                <button type="button" onClick={onClickAddChannel}>
                  채널 만들기
                </button>
                <button type="button" onClick={onLogout}>
                  로그아웃
                </button>
              </WorkspaceMenu>
            </Menu>

            {/* 채널 리스트 */}
            <ChannelList />
            {/* DM 리스트 */}
          </MenuScroll>
        </Channels>

        {/* 채팅 화면

        참고) Nested Routing
        - 이전 라우팅 주소도 포함되어야 한다. (예: /workspace)
        */}
        <Chats>
          <Switch>
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>

      {/* 모달 컴포넌트들 */}
      <WorkspaceModal show={showCreateWorkspaceModal} onCloseModal={onCloseModal} />
      <ChannelModal show={showCreateChannelModal} onCloseModal={onCloseModal} />
      <InviteWorkspaceModal show={showInviteWorkspaceModal} onCloseModal={onCloseModal} />
    </>
  );
}
