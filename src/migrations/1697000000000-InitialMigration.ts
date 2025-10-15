import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1697000000000 implements MigrationInterface {
  name = 'InitialMigration1697000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // users テーブル
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" varchar NOT NULL,
        "username" varchar NOT NULL,
        "password" varchar NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    // labels テーブル
    await queryRunner.query(`
      CREATE TABLE "labels" (
        "id" varchar PRIMARY KEY NOT NULL,
        "userId" varchar NOT NULL,
        "name" varchar NOT NULL,
        "color" varchar NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_labels_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_labels_userId" ON "labels" ("userId")
    `);

    // notes テーブル
    await queryRunner.query(`
      CREATE TABLE "notes" (
        "id" varchar PRIMARY KEY NOT NULL,
        "userId" varchar NOT NULL,
        "title" varchar,
        "content" text NOT NULL,
        "imageUrl" varchar,
        "position" integer NOT NULL DEFAULT (0),
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_notes_userId" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notes_userId" ON "notes" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notes_position" ON "notes" ("position")
    `);

    // note_labels テーブル（中間テーブル）
    await queryRunner.query(`
      CREATE TABLE "note_labels" (
        "noteId" varchar NOT NULL,
        "labelId" varchar NOT NULL,
        PRIMARY KEY ("noteId", "labelId"),
        CONSTRAINT "FK_note_labels_noteId" FOREIGN KEY ("noteId") REFERENCES "notes" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_note_labels_labelId" FOREIGN KEY ("labelId") REFERENCES "labels" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_note_labels_noteId" ON "note_labels" ("noteId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_note_labels_labelId" ON "note_labels" ("labelId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_note_labels_labelId"`);
    await queryRunner.query(`DROP INDEX "IDX_note_labels_noteId"`);
    await queryRunner.query(`DROP TABLE "note_labels"`);
    await queryRunner.query(`DROP INDEX "IDX_notes_position"`);
    await queryRunner.query(`DROP INDEX "IDX_notes_userId"`);
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`DROP INDEX "IDX_labels_userId"`);
    await queryRunner.query(`DROP TABLE "labels"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
