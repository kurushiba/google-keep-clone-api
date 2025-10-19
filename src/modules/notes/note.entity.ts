import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Label } from '../labels/label.entity';

@Entity('notes')
export class Note {
  @PrimaryColumn('varchar')
  id!: string;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: 0 })
  position!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToMany(() => Label)
  @JoinTable({
    name: 'note_labels',
    joinColumn: { name: 'noteId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'labelId', referencedColumnName: 'id' },
  })
  labels!: Label[];
}
