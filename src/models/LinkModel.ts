import { createHash } from 'crypto';
import { AppDataSource } from '../dataSource';
// import { User } from '../entities/User';
import { Link } from '../entities/Link';

const linkRepository = AppDataSource.getRepository(Link);

async function getLinkById(linkId: string): Promise<Link | null> {
  return await linkRepository.findOne({ where: { linkId }, relations: ['user'] });
}

function createLinkId(originalUrl: string, userId: string): string {
  const md5 = createHash('md5');
  md5.update(/* TODO: concatenate the original url and userId */ originalUrl + userId);
  const urlHash = md5.digest('base64url');
  /* TODO: Get only the first 9 characters of `urlHash` */
  const linkId = urlHash.slice(0, 9);
  return linkId;
}
export { getLinkById, createLinkId };
