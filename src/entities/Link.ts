import { Entity, PrimaryColumn, Column, ManyToOne, Relation } from 'typeorm';
import { User } from './User';

@Entity()
export class Link {
  @PrimaryColumn()
  linkId: string;

  @Column({ default: '' })
  originalUrl: string;

  @Column({ default: 0 })
  numHits: number;

  @Column()
  lastAccessedOn: Date;

  @ManyToOne(() => User, (user) => user.links, { cascade: ['insert', 'update'] })
  user: Relation<User>;

  @ManyToOne(() => User, (user) => user.createdLinks, { cascade: ['insert', 'update'] })
  creator: Relation<User>;
}
