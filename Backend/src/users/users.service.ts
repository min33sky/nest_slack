import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entities/Users';
import { Connection, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { ChannelMembers } from 'src/entities/ChannelMembers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    private connection: Connection,
  ) {}

  /**
   * 이메일로 회원 찾기
   * @param email
   * @returns
   */
  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
      select: ['id', 'email', 'password'],
    });
  }

  /**
   * 회원 가입
   * @param email
   * @param nickname
   * @param password
   */
  async join(email: string, nickname: string, password: string) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();

    // const user = await this.userRepository.findOne({
    //   where: {
    //     email,
    //   },
    // });

    // if (user) {
    //   throw new UnauthorizedException('이미 존재하는 회원입니다.');
    // }

    const hashedPassword = await bcrypt.hash(password, 12);

    await queryRunner.startTransaction();

    try {
      /**
       * ? 회원 가입 시 최초 워크스페이스와 채널도 자동으로 설정해준다.
       * ? DB에 저장하는 방식은 여러가지가 있어서 선호하는 방식을 사용해도 된다.
       */

      const returned = await queryRunner.manager
        .getRepository<Users>(Users)
        .save({
          email,
          nickname,
          password: hashedPassword,
        });

      // const returned = await this.userRepository.save({
      //   email,
      //   nickname,
      //   password: hashedPassword,
      // });

      // const workspaceMembers = new WorkspaceMembers();
      const workspaceMembers = this.workspaceMembersRepository.create();
      workspaceMembers.UserId = returned.id;
      workspaceMembers.WorkspaceId = 1;
      await queryRunner.manager.save(workspaceMembers);

      // await this.workspaceMembersRepository.save({
      //   UserId: returned.id,
      //   WorkspaceId: 1,
      // });
      // await this.channelMembersRepository.save({
      //   UserId: returned.id,
      //   ChannelId: 2,
      // });
      const channelMembers = this.channelMembersRepository.create();
      channelMembers.UserId = returned.id;
      channelMembers.ChannelId = 1;
      await queryRunner.manager.save(channelMembers);

      // Commit
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }

    console.log('################ 실행 되냐?? ######################');

    return true;
  }
}
