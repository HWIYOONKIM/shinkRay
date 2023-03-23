import { AppDataSource } from '../dataSource';
// import { User } from '../entities/User';
import { Link } from '../entities/Link';

const linkRepository = AppDataSource.getRepository(Link);

async function getLinkById(linkId: string): Promise<Link | null> {
  return await linkRepository.findOne({ where: { linkId }, relations: ['user'] });
}
export { getLinkById };
