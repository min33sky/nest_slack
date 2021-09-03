import { IDM, IChannel, IChat } from '@typings/db';
import dayjs from 'dayjs';

/**
 * 날짜별로 채팅 섹션을 생성하는 함수
 * @param chatList
 * @returns
 */
export default function makeSection(chatList: (IDM | IChat)[]) {
  const sections: { [key: string]: (IDM | IChat)[] } = {};

  chatList.forEach((chat) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');
    // ? ['2021-08-30': [{채팅데이터}, {채팅데이터}]]
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
  });

  return sections;
}
