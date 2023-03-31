import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from 'typeorm';
import { Link } from './Link';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  passwordHash: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isPro: boolean;

  @OneToMany(() => Link, (link) => link.user, { cascade: ['insert', 'update'] })
  links: Relation<Link>[];

  @OneToMany(() => Link, (link) => link.creator, { cascade: ['insert', 'update'] })
  createdLinks: Relation<Link>[];
}
