import session from 'express-session';
import MongoStore from 'connect-mongo';

// Using object destructuring and shorthand
const { SESSION_SECRET, MONGODB_URI, NODE_ENV } = process.env;

const ONE_DAY = 24 * 60 * 60;
const ONE_DAY_MS = ONE_DAY * 1000;

const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: ONE_DAY
  }),
  cookie: {
    secure: NODE_ENV === 'production',
    maxAge: ONE_DAY_MS
  }
};

export default sessionConfig;