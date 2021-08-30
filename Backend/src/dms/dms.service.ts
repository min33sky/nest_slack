import { onlineMap } from './../events/onlineMap';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DMs } from 'src/entities/DMs';
import { Users } from 'src/entities/Users';
import { Workspaces } from 'src/entities/Workspaces';
import { EventsGateway } from 'src/events/events.gateway';
import { MoreThan, Repository } from 'typeorm';

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

@Injectable()
export class DmsService {
  private readonly logger = new Logger(DmsService.name);

  constructor(
    @InjectRepository(Workspaces)
    private workspacesRepository: Repository<Workspaces>,
    @InjectRepository(DMs) private dmsRepository: Repository<DMs>,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  // TODO: 체크해봐야함
  async getWorkspaceDMs(url: string, myId: number) {
    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.dms', 'dms', 'dms.senderId = :myId', { myId })
      .leftJoin('dms', 'workspace', 'workspace.url = :url', { url })
      .getMany();
  }

  async getWorkspaceDMChats(
    url: string,
    id: number,
    myId: number,
    perPage: number,
    page: number,
  ) {
    const result = await this.dmsRepository
      .createQueryBuilder('dms')
      .innerJoinAndSelect('dms.Sender', 'sender')
      .innerJoinAndSelect('dms.Receiver', 'receiver')
      .innerJoin('dms.Workspace', 'workspace')
      .where('workspace.url = :url', { url })
      .andWhere(
        '((dms.SenderId = :myId AND dms.ReceiverId = :id) OR (dms.ReceiverId =:myId AND dms.SenderId =:id))',
        { id, myId },
      )
      .orderBy('dms.createdAt', 'DESC')
      .take(perPage)
      .skip(perPage * (page - 1))
      .getMany();

    this.logger.debug(`DM 채팅 내역 : ${result} `);
    return result;
  }

  async createWorkspaceDMChats(
    url: string,
    content: string,
    id: number,
    myId: number,
  ) {
    const workspace = await this.workspacesRepository.findOne({
      where: { url },
    });

    this.logger.debug(`DM 내용: ${url}, ${content}, ${id}, ${myId}`);

    const dm = new DMs();
    dm.SenderId = myId;
    dm.ReceiverId = id;
    dm.content = content;
    dm.WorkspaceId = workspace.id;

    const savedDm = await this.dmsRepository.save(dm);
    const dmWithSender = await this.dmsRepository.findOne({
      where: {
        id: savedDm.id,
      },
      relations: ['Sender'],
    });
    const receiverSocketId = getKeyByValue(
      onlineMap[`/ws-${workspace.url}`],
      Number(id),
    );

    this.logger.debug(`DM 상대편에게 전송하기: ${dmWithSender}`);
    this.eventsGateway.server.to(receiverSocketId).emit('dm', dmWithSender);
  }

  async createWorkspaceDMImages(
    url: string,
    files: Express.Multer.File[],
    id: number,
    myId: number,
  ) {
    const workspace = await this.workspacesRepository.findOne({
      where: {
        url,
      },
    });

    for (let i = 0; i < files.length; i++) {
      const dm = new DMs();
      dm.SenderId = myId;
      dm.ReceiverId = id;
      dm.content = files[i].path;
      dm.WorkspaceId = workspace.id;
      const savedDm = await this.dmsRepository.save(dm);
      const dmWithSender = await this.dmsRepository.findOne({
        where: { id: savedDm.id },
        relations: ['Sender'],
      });
      const receiverSocketId = getKeyByValue(
        onlineMap[`/ws-${workspace.url}`],
        Number(id),
      );
      this.eventsGateway.server.to(receiverSocketId).emit('dm', dmWithSender);
    }
  }

  async getDMUnreadsCount(url, id, myId, after) {
    const workspace = await this.workspacesRepository.findOne({
      where: { url },
    });

    return this.dmsRepository.count({
      where: {
        WorkspaceId: workspace.id,
        SenderId: id,
        ReceiverId: myId,
        createdAt: MoreThan(new Date(after)),
      },
    });
  }
}
