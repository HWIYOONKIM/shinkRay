import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { registerUser, logIn } from './controllers/UserController';
import {
  shortenUrl,
  getOriginalUrl,
  getLinksForUser,
  deleteLink,
} from './controllers/LinkController';

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;

const SQLiteStore = connectSqlite3(session);

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite' }),
    secret: COOKIE_SECRET,
    cookie: { maxAge: 8 * 60 * 60 * 1000 }, // 8 hours
    name: 'session',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.json());
// Implement endpoints here
app.post('/api/users', registerUser); // Create an account
app.post('/api/login', logIn); // Log in to an account
app.post('/api/links', shortenUrl); // Create a new shortened link
app.get('/:linkId', getOriginalUrl); // Visit a shortended link
app.get('/api/users/:userId/links', getLinksForUser); // Get all links for the target user
app.delete('/api/users/:userId/links/:linkId', deleteLink); // Delete the specified link
app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
