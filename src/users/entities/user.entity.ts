import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Chat } from '../../chats/entities/chat.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Chat, (chat) => chat.user)
  chats: Chat[];
}
