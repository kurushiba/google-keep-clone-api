import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Note } from '../notes/note.entity';
import { Label } from '../labels/label.entity';

@Entity('users')
export class User {
  @PrimaryColumn('varchar')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Note, (note) => note.user)
  notes!: Note[];

  @OneToMany(() => Label, (label) => label.user)
  labels!: Label[];
}
