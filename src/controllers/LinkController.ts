import { Request, Response } from 'express';
import {
  createLinkId,
  createNewLink,
  getLinkById,
  updateLinkVisits,
  getLinksByUserId,
  getLinksByUserIdForOwnAccount,
  deleteLinkById,
} from '../models/LinkModel';
import { getUserById } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';

async function shortenUrl(req: Request, res: Response): Promise<void> {
  // Make sure the user is logged in
  if (!req.session.isLoggedIn) {
    res.sendStatus(401).send('User not logged in.');
    return;
  }
  // Get the userId from `req.session`
  const { userId } = req.session.authenticatedUser;

  // Retrieve the user's account data using their ID
  const user = await getUserById(userId);
  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  // Check if the user is neither a "pro" nor an "admin" account
  if (!user.isPro && !user.isAdmin) {
    // check how many links they've already generated
    const numLinks = user.links.length;
    // if they have generated 5 links
    if (numLinks >= 5) {
      res.status(403).send('Maximum is up to 5 links');
      return;
    }
  }
  // Generate a `linkId`
  const linkId = createLinkId(req.body.originalUrl, userId);

  // Add the new link to the database (wrap this in try/catch)
  try {
    const link = await createNewLink(req.body.originalUrl, linkId, user);
    res.status(201).json({
      linkId: link.linkId,
      originalURL: link.originalUrl,
      numHits: link.numHits,
      lastAccessedOn: link.lastAccessedOn,
      user: {
        userId: user.userId,
        username: user.username,
        isAdmin: user.isAdmin,
        isPro: user.isPro,
      },
    });
    console.log(link);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function getOriginalUrl(req: Request, res: Response): Promise<void> {
  // Retrieve the link data using the targetLinkId from the path parameter
  const targetLinkId = req.params.linkId;
  const link = await getLinkById(targetLinkId);

  // Check if you got back `null`
  if (!link) {
    res.status(404).send('Link not found');
    return;
  }

  // Call the appropriate function to increment the number of hits and the last accessed date
  const updatedLink = await updateLinkVisits(link);

  // Redirect the client to the original URL
  res.redirect(301, updatedLink.originalUrl);
}

async function getLinksForUser(req: Request, res: Response): Promise<void> {
  try {
    const targetUserId = req.params.userId;

    const user = await getUserById(targetUserId);
    if (!user) {
      res.status(404).send({ message: 'User not found' });
      return;
    }
    const { userId } = req.session.authenticatedUser;

    let links;
    if (userId === targetUserId) {
      links = await getLinksByUserIdForOwnAccount(targetUserId);
    } else {
      links = await getLinksByUserId(targetUserId);
    }

    res.status(200).send(links);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

type LinkIdParam = {
  linkId: string;
};
async function deleteLink(req: Request, res: Response): Promise<void> {
  const { linkId } = req.params as LinkIdParam;
  const { isLoggedIn, isAdmin, authenticatedUser } = req.session;

  if (!isLoggedIn) {
    res.status(401).send('User not logged in.');
    return;
  }

  try {
    const link = await getLinkById(linkId);

    if (!link) {
      res.status(404).send('Link not found');
      return;
    }

    if (isAdmin || link.user.userId === authenticatedUser.userId) {
      await deleteLinkById(linkId);
      res.sendStatus(200);
    } else {
      res.status(403).send('User not authorized to delete this link');
    }
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export { shortenUrl, getOriginalUrl, getLinksForUser, deleteLink };
