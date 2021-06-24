import { WorkspaceMembers } from './../entities/WorkspaceMembers';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workspaces } from 'src/entities/Workspaces';
import { Repository, Connection } from 'typeorm';
import { Channels } from 'src/entities/Channels';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Users } from 'src/entities/Users';

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
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,

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

  /**
   * 현재 워크스페이스의 사람들을 가져오기
   * @param url
   */
  async getWorkspaceMembers(url: string) {
    this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.WorkspaceMembers', 'members')
      .innerJoin('members.Workspace', 'w', 'w.url = :url', { url })
      .getMany();
  }

  /**
   * 워크스페이스에 사람 초대하기
   * @param url
   * @param email
   */
  async createWorkspaceMembers(url, email) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    const workspace = await this.workspacesRepository.findOne({
      where: {
        url,
      },
      /**
       *? relations 혹은 join으로 조인하기
       *? innerJoinAndSelect: TypeORM에서 innerJoin은 조인한 테이블을 필터링만 할 뿐 가져오지 않는다.
       *?                     하지만 innerJoinAndSelect는 조인한 테이블 값까지 함께 가져온다.
       */
      // relations: ['Channel'],
      join: {
        alias: 'workspace',
        innerJoinAndSelect: {
          channels: 'workspace.Channels',
        },
      },
    });

    //? 위의 코드를 QueryBuilder로 작성하기
    // const workspace = await this.workspacesRepository
    //   .createQueryBuilder('workspace')
    //   .where('workspace.url = :url', { url })
    //   .innerJoinAndSelect('workspace.Channels', 'channels')
    //   .getOne();

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('해당 유저가 존재하지 않습니다.');
    }

    // 트랜잭션 시작
    await queryRunner.startTransaction();

    try {
      const workspaceMember = new WorkspaceMembers();
      workspaceMember.WorkspaceId = workspace.id;
      workspaceMember.UserId = user.id;

      await queryRunner.manager.save(workspaceMember);

      const channelMember = new ChannelMembers();
      channelMember.ChannelId = workspace.Channels.find(
        (v) => v.name === '일반',
      ).id;
      channelMember.UserId = user.id;

      await queryRunner.manager.save(channelMember);

      // 커밋
      await queryRunner.commitTransaction();
    } catch (err) {
      // 롤백
      await queryRunner.rollbackTransaction();
    } finally {
      // 연결 끊기
      await queryRunner.release();
    }
  }
}
