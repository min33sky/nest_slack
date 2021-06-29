import { Users } from 'src/entities/Users';

/**
 * 채팅 데이터 관련 인터페이스
 */
export interface ChatData {
  url: string; // 워크스페이스 URL
  name: string; // 채널 이름
  content: string; // 채팅 내용
  user: Users; // 채팅 작성자
}
