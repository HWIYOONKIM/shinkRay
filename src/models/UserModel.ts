import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

async function getUserByUsername(username: string): Promise<User | null> {
  // TODO: Get the user by where the username matches the parameter
  // This should also retrieve the `links` relation
  return await userRepository.findOne({ where: { username }, relations: ['links'] });
}

async function addNewUser(username: string, passwordHash: string): Promise<User | null> {
  // TODO: Add the new user to the database
  let newUser = new User();
  newUser.username = username;
  newUser.passwordHash = passwordHash;
  newUser = await userRepository.save(newUser);

  return newUser;
}

async function getUserById(userId: string): Promise<User | null> {
  const user = await userRepository
    .createQueryBuilder('user')
    .where({ userId })
    .leftJoinAndSelect('user.links', 'links')
    .getOne();
  return user;
}
export { getUserByUsername, addNewUser, getUserById };
