import { createHash } from 'crypto';
import { AppDataSource } from '../dataSource';
import { Link } from '../entities/Link';
import { User } from '../entities/User';

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

async function createNewLink(originalUrl: string, linkId: string, creator: User): Promise<Link> {
  // TODO: Implement me!
  let link = new Link();
  link.linkId = linkId;
  link.originalUrl = originalUrl;
  link.user = creator;
  const now = new Date();
  link.lastAccessedOn = now;
  link = await linkRepository.save(link);

  return link;
}

async function updateLinkVisits(link: Link): Promise<Link> {
  const updateLink = { ...link };
  // Increment the link's number of hits property
  updateLink.numHits += 1;
  // Create a new date object and assign it to the link's `lastAccessedOn` property.
  const now = new Date();
  updateLink.lastAccessedOn = now;
  // Update the link's numHits and lastAccessedOn in the database
  const updatedLink = await linkRepository.save(link);
  // return the updated link
  return updatedLink;
}

async function getLinksByUserId(userId: string): Promise<Link[]> {
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } }) // NOTES: This is how you do nested WHERE clauses
    .leftJoin('link.user', 'user')
    .select(['link.linkId', 'link.originalUrl', 'user.userId', 'user.username', 'user.isAdmin'])
    .getMany();

  return links;
}

async function getLinksByUserIdForOwnAccount(userId: string): Promise<Link[]> {
  const fields = [
    'link.linkId',
    'link.originalUrl',
    'link.numHits',
    'link.lastAccessedOn',
    'user.userId',
    'user.username',
    'user.isPro',
    'user.isAdmin',
  ];
  const links = await linkRepository
    .createQueryBuilder('link')
    .where({ user: { userId } })
    .leftJoin('link.user', 'user')
    .select(fields)
    .getMany();

  return links;
}
export {
  getLinkById,
  createLinkId,
  createNewLink,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
};
