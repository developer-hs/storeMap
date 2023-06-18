import express from 'express';
import cors from 'cors';
import expressSanitizer from 'express-sanitizer';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import axios from 'axios';

import { __dirname } from './utils/utils.js';
import getAdminJs from './admin.js';
import db from './app/mongodb/models/index.js';
import userRoutes from './app/users/routes/index.js';
import storeRoutes from './app/stores/routes/index.js';
import widgetRoutes from './app/widgets/routes/index.js';
import productRoutes from './app/products/routes/index.js';

import { User } from './app/users/models/user.js';
import { Store } from './app/stores/models/store.js';
import { authJWT } from './app/users/middleware/auth.js';
import { CAFE24_AUTH } from './app/config/index.js';

process.env.NODE_ENV =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() == 'production'
    ? 'production'
    : 'development';

export const app = express();

const allowlist = [
  'http://localhost:8080',
  'https://localhost:8000',
  'http://127.0.0.1:8080',
  'https://127.0.0.1:8000',
  'https://rlagudtjq2016.cafe24.com',
];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true, credentials: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }

  callback(null, corsOptions); // callback expects two parameters: error and options
};

const appInit = async () => {
  app.set('view engine', 'ejs'); // 템플릿 엔진 설정
  app.set('views', path.join(__dirname, 'views'));
  // 레이아웃 파일 경로 설정 (선택사항)
  app.use(expressLayouts); // EJS LAYOUT
  app.set('layout', 'layouts/index'); // 레이아웃 파일은 "views/layouts/index.ejs"에 위치해야 합니다.
  app.set('layout extractScripts', true);
  app.set('layout extractStyles', true);
  app.use(express.json()); //body parser
  app.use(express.urlencoded({ extended: true })); // body parser
  app.use(expressSanitizer());
  // 정적 파일 경로 설정 (선택사항)
  app.use(express.static('public')); // apply css , js
  app.use(cors(corsOptionsDelegate)); // cors setting
  app.use(cookieParser());
  const adminJs = await getAdminJs();
  app.use(adminJs.admin.options.rootPath, adminJs.adminRouter);
};

const connectDB = async () => {
  db.mongoose
    .connect(db.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      // console.log("db.url", db.url);
      // console.log("db.mongoose", db.mongoose);
      // console.log("db.tutorial.db", db.tutorial.db);
      console.log('Database Connection Success.');
    })
    .catch((err) => {
      console.log('Database Connection Failure.', err);
      process.exit();
    });
};

const appRouting = () => {
  userRoutes(app);
  storeRoutes(app);
  widgetRoutes(app);
  productRoutes(app);

  app.get('/redirect', (req, res) => {
    return res.redirect('/users/register');
  });

  app.get('/', (req, res) => {
    return res.sendFile(__dirname + '/views/auth/index.html');
  });

  app.post('/cafe24/oauth/:mallId', async (req, res) => {
    const { mallId } = req.params;

    const form = { ...req.body };
    const headers = {
      Authorization: `Basic ${CAFE24_AUTH}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const tokenRes = await axios.post(
        `https://${mallId}.cafe24api.com/api/v2/oauth/token`,
        form,
        headers
      );

      if (tokenRes.status === 200) {
        try {
          let user = await User.findOne({ mallId: mallId });

          if (!user) {
            const registerRes = await axios.post('/api/users/register', {
              email: `${mallId}@cafe24.com`,
              password: mallId,
              mallId: mallId,
              platform: 'cafe24',
            });

            if (!registerRes.ok) {
              return res.json({
                ok: false,
                message: '회원가입에 실패하였습니다.',
              });
            }

            user = await User.findOne({ mallId: mallId });
          }

          user.cafe24AccessToken = tokenRes.data.access_token;
          await user.save();

          res.cookie('cafe24_refresh_token', tokenRes.data.refresh_token, {
            httpOnly: true,
            secure: true,
          });

          return res.status(200).send(user);
        } catch (error) {
          console.error(error);
          return res.json({ ok: false, message: error });
        }
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ ok: false, message: error });
    }
  });

  app.get('/test', (req, res) => {
    return res.sendFile(__dirname + '/routes/stores/test.html');
  });

  app.get('/oauth', (req, res) => {
    return console.log(req);
  });
};

app.listen();

const appStart = async () => {
  await appInit();
  await connectDB();
  appRouting();
};

const init = () => {
  appStart();
};

init();
