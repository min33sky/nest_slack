import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ChannelMembers } from '../entities/ChannelMembers';
import { Users } from '../entities/Users';
import { WorkspaceMembers } from '../entities/WorkspaceMembers';
import { UsersService } from './users.service';

class MockUserRepository {
  #data = [{ id: 1, email: 'zerohch0@gmail.com' }];
  findOne({ where: { email } }) {
    const data = this.#data.find((v) => v.email === email);
    if (data) {
      return data;
    }
    return null;
  }
}
class MockWorkspaceMembersRepository {}
class MockChannelMembersRepository {}
class MockConnection {}

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Users),
          useClass: MockUserRepository,
        },
        {
          provide: getRepositoryToken(WorkspaceMembers),
          useClass: MockWorkspaceMembersRepository,
        },
        {
          provide: getRepositoryToken(ChannelMembers),
          useClass: MockChannelMembersRepository,
        },
        {
          provide: Connection,
          useClass: MockConnection,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('findByEmail은 이메일을 통해 유저를 찾아야 함', () => {
    // promise를 리턴하므로 resolves 사용
    expect(service.findByEmail('messi@gmail.com')).resolves.toStrictEqual({
      email: 'messi@gmail.com',
      id: 1,
    });
  });

  it('findByEmail은 유저를 못 찾으면 null을 반환해야 함', () => {
    expect(service.findByEmail('messi@gmil.com')).resolves.toBe(null);
  });
});
