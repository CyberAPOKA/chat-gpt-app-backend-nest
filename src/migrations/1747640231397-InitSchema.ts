import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1747640231397 implements MigrationInterface {
    name = 'InitSchema1747640231397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_619bc7b78eba833d2044153bacc\``);
        await queryRunner.query(`ALTER TABLE \`message\` CHANGE \`chatId\` \`chatId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`chat\` DROP FOREIGN KEY \`FK_52af74c7484586ef4bdfd8e4dbb\``);
        await queryRunner.query(`ALTER TABLE \`chat\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_619bc7b78eba833d2044153bacc\` FOREIGN KEY (\`chatId\`) REFERENCES \`chat\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chat\` ADD CONSTRAINT \`FK_52af74c7484586ef4bdfd8e4dbb\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chat\` DROP FOREIGN KEY \`FK_52af74c7484586ef4bdfd8e4dbb\``);
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_619bc7b78eba833d2044153bacc\``);
        await queryRunner.query(`ALTER TABLE \`chat\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`chat\` ADD CONSTRAINT \`FK_52af74c7484586ef4bdfd8e4dbb\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`message\` CHANGE \`chatId\` \`chatId\` varchar(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_619bc7b78eba833d2044153bacc\` FOREIGN KEY (\`chatId\`) REFERENCES \`chat\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
