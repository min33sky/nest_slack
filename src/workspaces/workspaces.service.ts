import { WorkspaceMembers } from './../entities/WorkspaceMembers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspaces } from 'src/entities/Workspaces';
import { Repository, Connection } from 'typeorm';
import { Channels } from 'src/entities/Channels';
import { ChannelMembers } from 'src/entities/ChannelMembers';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspaces)
    private workspacesRepository: Repository<Workspaces>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    private connection: Connection,
  ) {}

  async findById(id: number) {
    return this.workspacesRepository.findByIds([id]);
  }

  async findByWorkspaces(myId: number) {
    return this.workspacesRepository.find({
      where: {
        WorkspaceMembers: [
          {
            UserId: myId,
          },
        ],
      },
    });
  }

  async createWorkspace(name: string, url: string, myId: number) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      //! create 메서드를 사용한다고 DB에 저장되는 것이 아니라 엔티티 객체를 생성할 뿐이다. 저장은 save!!
      //! 해깔리면 new 생성자를 이용하는 방법 사용
      const workspace = new Workspaces();
      workspace.name = name;
      workspace.url = url;
      workspace.OwnerId = myId;
      const returned = await queryRunner.manager.save(workspace);
      const workspaceMember = new WorkspaceMembers();
      workspaceMember.UserId = myId;
      workspaceMember.WorkspaceId = returned.id;
      await queryRunner.manager.save(workspaceMember);
      const channel = new Channels();
      channel.name = '일반';
      channel.WorkspaceId = returned.id;
      const channelReturned = await queryRunner.manager.save(channel);
      const channelMember = new ChannelMembers();
      channelMember.UserId = myId;
      channelMember.ChannelId = channelReturned.id;
      await queryRunner.manager.save(channelMember);

      // Commit
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // TODO: Exception을 throw해주면 될 듯
    } finally {
      await queryRunner.release();
    }
  }
}
