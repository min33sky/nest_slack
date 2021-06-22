import { MigrationInterface, QueryRunner } from 'typeorm';

export class categoryToType1624374807875 implements MigrationInterface {
  name = 'categoryToType1624374807875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `mentions` RENAME COLUMN `category` TO `type`',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `mentions` RENAME COLUMN `type` TO `category`',
    );
  }
}
