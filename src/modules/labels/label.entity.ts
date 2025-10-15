import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('labels')
export class Label {
  @PrimaryColumn('varchar')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  name!: string;

  @Column()
  color!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.labels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;
}
