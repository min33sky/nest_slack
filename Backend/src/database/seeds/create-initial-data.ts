import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

/**
 * ? DB의 최초 데이터를 넣어주는 코드
 * npm run seed:run
 */
export class CreateInitialData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into('Workspaces')
      .values([{ id: 1, name: 'Sleact', url: 'sleact' }])
      .execute();
    await connection
      .createQueryBuilder()
      .insert()
      .into('Channels')
      .values([{ id: 1, name: '일반', WorkspaceId: 1, private: false }])
      .execute();
  }
}
