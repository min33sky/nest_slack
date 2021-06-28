import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelChats } from 'src/entities/ChannelChats';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';
import { MoreThan, Repository } from 'typeorm';
import { ChatData } from './interface/chat.interface';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Workspaces)
    private workspaceRepository: Repository<Workspaces>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    @InjectRepository(ChannelChats)
    private channelChatsRepository: Repository<ChannelChats>,
  ) {}

  async findById(id: number) {
    return this.channelsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async getWorkspaceChannels(url: string, myId: number) {
    return this.channelsRepository
      .createQueryBuilder('channels')
      .innerJoinAndSelect(
        'channels.ChannelMembers',
        'channelMembers',
        'channelMembers.userId = :myId',
        { myId },
      )
      .innerJoinAndSelect(
        'channels.Workspace',
        'workspace',
        'workspace.url = :url',
        { url },
      )
      .getMany();
  }

  async getWorkspaceChannel(url: string, name: string) {
    return this.channelsRepository.findOne({
      where: {
        name,
      },
      relations: ['Workspace'],
    });
  }

  async createWorkspaceChannel(url: string, name: string, myId: number) {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        url,
      },
    });

    const channel = new Channels();
    channel.name = name;
    channel.WorkspaceId = workspace.id;

    const channelReturned = await this.channelsRepository.save(channel);

    const channelMember = new ChannelMembers();
    channelMember.UserId = myId;
    channelMember.ChannelId = channelReturned.id;
    await this.channelMembersRepository.save(channelMember);
  }

  async getWorkspaceChannelMembers(url: string, name: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.Channels', 'channels', 'channels.name = :name', {
        name,
      })
      .innerJoin('channels.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .getMany();
  }

  async createWorkspaceChannelMembers(url, name, email) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();

    if (!channel) {
      throw new NotFoundException('채널이 존재하지 않습니다.');
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .innerJoin('user.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException('사용자가 존재하지 않습니다.');
    }

    const channelMember = new ChannelMembers();
    channelMember.ChannelId = channel.id;
    channelMember.UserId = user.id;
    await this.channelMembersRepository.save(channelMember);
  }

  /**
   * 워크스페이스 특정 채널 채팅 모두 가져오기
   * @param url
   * @param name
   * @param perPage
   * @param page
   * @returns
   */
  async getWorkspaceChannelChats(
    url: string,
    name: string,
    perPage: number,
    page: number,
  ) {
    return this.channelChatsRepository
      .createQueryBuilder('channelChats')
      .innerJoin('channelChats.Channel', 'channel', 'channel.name = :name', {
        name,
      })
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .innerJoinAndSelect('channelChats.User', 'user')
      .orderBy('channelChats.createdAt', 'DESC')
      .take(perPage) // limit
      .skip(perPage * (page - 1))
      .getMany();
  }

  /**
   * TODO: 웹소켓 작성 필요
   * 워크스페이스 특정 채널 채팅 모두 가져오기
   */
  async createWorkspaceChannelChats({ content, name, user, url }: ChatData) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();

    if (!channel) {
      throw new NotFoundException('채널이 존재하지 않습니다.');
    }

    const chats = new ChannelChats();
    chats.content = content;
    chats.UserId = user.id;
    chats.ChannelId = channel.id;
    const savedChat = await this.channelChatsRepository.save(chats);
    // 쿼리를 날릴 필요없이 유저정보와 채널정보를 넣어주는게 낫겠다.
    // chats.Channel = channel;
    // chats.User = User; //? myId대산 user를 가져오자

    const chatWithUser = await this.channelChatsRepository.findOne({
      where: {
        id: savedChat.id,
      },
      relations: ['User', 'Channel'],
    });
    // TODO 웹소켓 코드 추가
  }

  /**
   * 안 읽은 메세지 개수 가져오기
   * @param url
   * @param name
   * @param after 마지막 읽은 메세지의 시간
   * @returns
   */
  async getChannelUnreadsCount(url, name, after) {
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();

    // Count(*)
    return this.channelChatsRepository.count({
      where: {
        ChannelId: channel.id,
        createdAt: MoreThan(new Date(after)),
      },
    });
  }
}
