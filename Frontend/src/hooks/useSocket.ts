import { useCallback } from 'react';
import io from 'socket.io-client';

const BACK_URL = 'http://localhost:3095';

const sockets: { [key: string]: SocketIOClient.Socket } = {};

/**
 * SocketIO Hook
 * @param workspace 워크스페이스 이름
 * @returns [소켓, 소캣 연결 종료 함수]
 */
const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
      console.log('소켓 연결이 끊겼습니다.: ', workspace);
    }
  }, [workspace]);

  if (!workspace) return [undefined, disconnect]; // ? 리턴 타입 형식과 맞춰야 한다.

  //* 이미 존재하는 소캣 재생성 방지
  if (!sockets[workspace]) {
    sockets[workspace] = io.connect(`${BACK_URL}/ws-${workspace}`, {
      transports: ['websocket'], // ? 무조건 websocket으로만 연결 강제하기
    });
    console.info('create socket', workspace, sockets[workspace]);
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;
