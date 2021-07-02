/**
 * 워크스페이스 타입
 */
export interface Workspace {
  id: number;
  name: string;
  url: string;
  OwnerId: number;
  createdAt: string;
  deletedAt?: string;
  updatedAt: string;
}

/**
 * 유저 정보 타입
 */
export interface UserInfo {
  email: string;
  id: number;
  nickname: string;
  Workspaces: Workspace[];
}
