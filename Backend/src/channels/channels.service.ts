import { ChatImage } from './interface/chatImage.interface';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelChats } from 'src/entities/ChannelChats';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';
import { EventsGateway } from 'src/events/events.gateway';
import { MoreThan, Repository } from 'typeorm';
import { ChatData } from './interface/chat.interface';

@Injectable()
export class ChannelsService {
  private readonly logger = new Logger(ChannelsService.name);

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

    private eventsGateway: EventsGateway,
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
      throw new NotFoundException('????????? ???????????? ????????????.');
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .innerJoin('user.Workspaces', 'workspace', 'workspace.url = :url', {
        url,
      })
      .getOne();

    if (!user) {
      throw new NotFoundException('???????????? ???????????? ????????????.');
    }

    const channelMember = new ChannelMembers();
    channelMember.ChannelId = channel.id;
    channelMember.UserId = user.id;
    await this.channelMembersRepository.save(channelMember);
  }

  /**
   * ?????????????????? ?????? ?????? ?????? ?????? ????????????
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
      .take(perPage) // limitz
      .skip(perPage * (page - 1))
      .getMany();
  }

  /**
   * ?????? ????????? ??????
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
      throw new NotFoundException('????????? ???????????? ????????????.');
    }

    const chats = new ChannelChats();
    chats.content = content;
    chats.UserId = user.id;
    chats.ChannelId = channel.id;
    const savedChat = await this.channelChatsRepository.save(chats);
    // ????????? ?????? ???????????? ??????????????? ??????????????? ??????????????? ?????????.
    // chats.Channel = channel;
    // chats.User = User; //? myId?????? user??? ????????????

    const chatWithUser = await this.channelChatsRepository.findOne({
      where: {
        id: savedChat.id,
      },
      relations: ['User', 'Channel'],
    });

    this.logger.debug(`????????? ????????? ??????: /ws-${url}-${channel.id}`);
    // socket.io??? ?????????????????? + ?????? ??????????????? ??????
    this.eventsGateway.server
      .to(`/ws-${url}-${channel.id}`)
      .emit('message', chatWithUser);
    // this.eventsGateway.server
    //   .to(`/ws-sleact-1`)
    //   .emit('message2222', chatWithUser);
  }

  /**
   * ???????????? ???????????? ?????????
   * @param param0
   */
  async createWorkspaceChannelImage({ files, name, url, user }: ChatImage) {
    console.log(files);
    const channel = await this.channelsRepository
      .createQueryBuilder('channel')
      .innerJoin('channel.Workspace', 'workspace', 'workspace.url = :url', {
        url,
      })
      .where('channel.name = :name', { name })
      .getOne();

    if (!channel) {
      throw new NotFoundException('????????? ???????????? ????????????.');
    }

    for (let i = 0; i < files.length; i++) {
      const chats = new ChannelChats();
      chats.content = files[i].path;
      chats.UserId = user.id;
      chats.ChannelId = channel.id;
      chats.Channel = channel;
      chats.User = user;
      const savedChat = await this.channelChatsRepository.save(chats);

      this.eventsGateway.server
        .to(`/ws-${url}-${channel.id}`)
        .emit('message', savedChat);
    }
  }

  /**
   * ??? ?????? ????????? ?????? ????????????
   * @param url
   * @param name
   * @param after ????????? ?????? ???????????? ??????
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
