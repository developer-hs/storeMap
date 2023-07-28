import express from 'express';
import cors from 'cors';
import expressSanitizer from 'express-sanitizer';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import axios from 'axios';

import { __dirname, setCafe24AccessToken, setToken } from './utils/utils.js';
import getAdminJs from './admin.js';
import db from './app/mongodb/models/index.js';
import userRoutes from './app/users/routes/index.js';
import storeRoutes from './app/stores/routes/index.js';
import widgetRoutes from './app/widgets/routes/index.js';
import productRoutes from './app/products/routes/index.js';

import { User } from './app/users/models/user.js';
import { CAFE24_AUTH } from './app/config/index.js';
import { refresh } from './app/users/jwt/refresh.js';

process.env.NODE_ENV = process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'production' ? 'production' : 'development';

export const app = express();

const allowlist = [
  'https://storemap-389307.du.r.appspot.com',
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

const appRouting = async () => {
  userRoutes(app);
  storeRoutes(app);
  widgetRoutes(app);
  productRoutes(app);
  app.get('/', (req, res) => {
    return res.sendFile(__dirname + '/views/index.html');
  });

  app.get('/users/login/redirect', (req, res) => {
    return res.render('auth/redirectLogin.ejs', {
      message: '세션이 만료되었습니다. 다시 로그인 해 주세요.',
      cateId: 'redirectLogin',
    });
  });

  app.get('/token/refresh', async (req, res) => {
    const redirectURI = req.query.redirect_uri || '/stores';

    try {
      const tokenRes = await refresh(req, res);
      if (!tokenRes.ok) {
        return res.status(500).send({ ok: false, message: tokenRes.message });
      }
      const newAccessToken = tokenRes.data.newAccessToken;
      const refreshToken = tokenRes.data.refreshToken;
      setToken(res, newAccessToken, refreshToken);

      return res.redirect(redirectURI);
    } catch (error) {
      return res.render('auth/redirectLogin.ejs', {
        message: '다시 로그인 해 주세요.',
      });
    }
  });

  app.get('/cafe24/oauth', (req, res) => {
    return res.sendFile(__dirname + '/views/auth/index.html');
  });

  /**
   * @description 로그인 시 카페24 토큰 발급
   */
  app.post('/cafe24/oauth/:mallId', async (req, res) => {
    let user;
    const { mallId } = req.params;

    const form = req.body;
    const headers = {
      Authorization: `Basic ${CAFE24_AUTH}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      // cafe24 access token 요청
      const tokenRes = await axios.post(`https://${mallId}.cafe24api.com/api/v2/oauth/token`, form, {
        headers: headers,
      });

      if (tokenRes.status === 200) {
        try {
          user = await User.findOne({ mallId: mallId });

          if (!user || user === null) {
            const userForm = {
              email: `${mallId}@cafe24.com`,
              password: mallId,
              mallId: mallId,
              platform: 'cafe24',
            };
            // 유저가 존재하지 않을경우 -> 첫방문일 경우
            user = new User(userForm);
          }
        } catch (error) {
          // 유저 생성에 실패하였을 경우
          return res.status(500).json({
            ok: false,
            message: '유저 생성실패 !',
          });
        }

        user.generateToken((accessToken, refreshToken) => {
          setToken(res, accessToken, refreshToken);
        });
        user.cafe24RefreshToken = tokenRes.data.refresh_token;
        setCafe24AccessToken(res, tokenRes.data.access_token);

        await user.save();

        return res.status(200).json({ ok: true, message: '정상적으로 처리되었습니다.' });
      }
    } catch (error) {
      //cafe24 access token 요청 에 실패하였을 경우
      console.error(error);
      return res.status(400).json({ ok: false, message: 'access token 요청 실패!', error: error });
    }
  });

  app.get('/test', (req, res) => {
    return res.sendFile(__dirname + '/public/test.html');
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
