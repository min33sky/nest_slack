import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import useSWR from 'swr';
import gravatar from 'gravatar';
import Menu from '@components/Menu';
import loadable from '@loadable/component';
import { IUser } from '@typings/db';
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
  // TODO: 타입 좀 손 봐야함
  const { data: userData, revalidate } = useSWR<IUser & boolean>('/api/users', fetcher); // ? SWR은 KEY값이 동일하면 데이터가 공유된다.

  const [showUserMenu, setShowUserMenu] = useState(false); // 헤더의 사용자 메뉴
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false); // 워크스페이스 생성 모달

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
    });
  }, [revalidate]);

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
        {/* 워크스페이스  */}
        <Workspaces>
          {userData.Workspaces.map((ws) => (
            <Link key={ws.id} to={`/workspace/${ws.url}/channel/일반`}>
              <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
            </Link>
          ))}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>

        {/* 채널 */}
        <Channels>
          <WorkspaceName>Slack</WorkspaceName>
          <MenuScroll>메뉴 스크롤</MenuScroll>
        </Channels>

        {/* 채팅 화면 */}
        <Chats>
          {/*
          Nested Routing
          : 이전 라우팅 주소도 포함되어야 한다. (예: /workspace)
        */}
          <Switch>
            <Route path="/workspace/channel" component={Channel} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>

      {/* 모달 컴포넌트들 */}
    </>
  );
}
