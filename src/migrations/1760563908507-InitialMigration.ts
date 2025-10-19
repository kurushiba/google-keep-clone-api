import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1760563908507 implements MigrationInterface {
    name = 'InitialMigration1760563908507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "labels" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "name" varchar NOT NULL, "color" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "notes" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "title" varchar, "content" text, "imageUrl" varchar, "position" integer NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "email" varchar NOT NULL, "name" varchar NOT NULL, "password" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "note_labels" ("noteId" varchar NOT NULL, "labelId" varchar NOT NULL, PRIMARY KEY ("noteId", "labelId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_62d5d178da88ffaa65a4565105" ON "note_labels" ("noteId") `);
        await queryRunner.query(`CREATE INDEX "IDX_995a5dd62ca0e2eb8c7de67662" ON "note_labels" ("labelId") `);
        await queryRunner.query(`CREATE TABLE "temporary_labels" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "name" varchar NOT NULL, "color" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_f31f88025417e09223ea9a66b0b" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_labels"("id", "userId", "name", "color", "createdAt") SELECT "id", "userId", "name", "color", "createdAt" FROM "labels"`);
        await queryRunner.query(`DROP TABLE "labels"`);
        await queryRunner.query(`ALTER TABLE "temporary_labels" RENAME TO "labels"`);
        await queryRunner.query(`CREATE TABLE "temporary_notes" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "title" varchar, "content" text, "imageUrl" varchar, "position" integer NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_829532ff766505ad7c71592c6a5" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_notes"("id", "userId", "title", "content", "imageUrl", "position", "createdAt", "updatedAt") SELECT "id", "userId", "title", "content", "imageUrl", "position", "createdAt", "updatedAt" FROM "notes"`);
        await queryRunner.query(`DROP TABLE "notes"`);
        await queryRunner.query(`ALTER TABLE "temporary_notes" RENAME TO "notes"`);
        await queryRunner.query(`DROP INDEX "IDX_62d5d178da88ffaa65a4565105"`);
        await queryRunner.query(`DROP INDEX "IDX_995a5dd62ca0e2eb8c7de67662"`);
        await queryRunner.query(`CREATE TABLE "temporary_note_labels" ("noteId" varchar NOT NULL, "labelId" varchar NOT NULL, CONSTRAINT "FK_62d5d178da88ffaa65a4565105f" FOREIGN KEY ("noteId") REFERENCES "notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_995a5dd62ca0e2eb8c7de67662a" FOREIGN KEY ("labelId") REFERENCES "labels" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("noteId", "labelId"))`);
        await queryRunner.query(`INSERT INTO "temporary_note_labels"("noteId", "labelId") SELECT "noteId", "labelId" FROM "note_labels"`);
        await queryRunner.query(`DROP TABLE "note_labels"`);
        await queryRunner.query(`ALTER TABLE "temporary_note_labels" RENAME TO "note_labels"`);
        await queryRunner.query(`CREATE INDEX "IDX_62d5d178da88ffaa65a4565105" ON "note_labels" ("noteId") `);
        await queryRunner.query(`CREATE INDEX "IDX_995a5dd62ca0e2eb8c7de67662" ON "note_labels" ("labelId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_995a5dd62ca0e2eb8c7de67662"`);
        await queryRunner.query(`DROP INDEX "IDX_62d5d178da88ffaa65a4565105"`);
        await queryRunner.query(`ALTER TABLE "note_labels" RENAME TO "temporary_note_labels"`);
        await queryRunner.query(`CREATE TABLE "note_labels" ("noteId" varchar NOT NULL, "labelId" varchar NOT NULL, PRIMARY KEY ("noteId", "labelId"))`);
        await queryRunner.query(`INSERT INTO "note_labels"("noteId", "labelId") SELECT "noteId", "labelId" FROM "temporary_note_labels"`);
        await queryRunner.query(`DROP TABLE "temporary_note_labels"`);
        await queryRunner.query(`CREATE INDEX "IDX_995a5dd62ca0e2eb8c7de67662" ON "note_labels" ("labelId") `);
        await queryRunner.query(`CREATE INDEX "IDX_62d5d178da88ffaa65a4565105" ON "note_labels" ("noteId") `);
        await queryRunner.query(`ALTER TABLE "notes" RENAME TO "temporary_notes"`);
        await queryRunner.query(`CREATE TABLE "notes" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "title" varchar, "content" text, "imageUrl" varchar, "position" integer NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "notes"("id", "userId", "title", "content", "imageUrl", "position", "createdAt", "updatedAt") SELECT "id", "userId", "title", "content", "imageUrl", "position", "createdAt", "updatedAt" FROM "temporary_notes"`);
        await queryRunner.query(`DROP TABLE "temporary_notes"`);
        await queryRunner.query(`ALTER TABLE "labels" RENAME TO "temporary_labels"`);
        await queryRunner.query(`CREATE TABLE "labels" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "name" varchar NOT NULL, "color" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "labels"("id", "userId", "name", "color", "createdAt") SELECT "id", "userId", "name", "color", "createdAt" FROM "temporary_labels"`);
        await queryRunner.query(`DROP TABLE "temporary_labels"`);
        await queryRunner.query(`DROP INDEX "IDX_995a5dd62ca0e2eb8c7de67662"`);
        await queryRunner.query(`DROP INDEX "IDX_62d5d178da88ffaa65a4565105"`);
        await queryRunner.query(`DROP TABLE "note_labels"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "notes"`);
        await queryRunner.query(`DROP TABLE "labels"`);
    }

}
