import express from 'express';
import cors from 'cors';
import expressSanitizer from 'express-sanitizer';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import axios from 'axios';

import { __dirname, setCafe24AccessToken, setToken } from './utils/utils.js';

import db from './app/mongodb/models/index.js';
import userRoutes from './app/users/routes/index.js';
import storeRoutes from './app/stores/routes/index.js';
import widgetRoutes from './app/widgets/routes/index.js';
import productRoutes from './app/products/routes/index.js';
import orderRoutes from './app/orders/routes/index.js';

import { User } from './app/users/models/user.js';
import { CAFE24_AUTH } from './app/config/index.js';
import { refresh } from './app/users/jwt/refresh.js';

process.env.NODE_ENV = process.env.NODE_ENV && process.env.NODE_ENV.trim().toLowerCase() == 'production' ? 'production' : 'development';

import setAdminJs from './admin.js';
import { cafe24Auth } from './app/users/middleware/auth.js';

export const app = express();

const allowlist = [
  'https://storemap-389307.du.r.appspot.com',
  'https://storemap.store',
  'http://localhost:8080',
  'https://localhost:8000',
  'http://127.0.0.1:8080',
  'https://127.0.0.1:8000',
];

const corsOptionsDelegate = (req, callback) => {
  let corsOptions;

  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true, credentials: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }

  callback(null, { origin: true, credentials: true }); // callback expects two parameters: error and options
};

const appInit = async () => {
  app.set('view engine', 'ejs'); // 템플릿 엔진 설정
  app.set('views', path.join(__dirname, 'views'));
  // 레이아웃 파일 경로 설정 (선택사항)
  app.use(expressLayouts); // EJS LAYOUT
  app.set('layout', 'layouts/index'); // 레이아웃 파일은 "views/layouts/index.ejs"에 위치해야 합니다.
  app.set('layout extractScripts', true);
  app.set('layout extractStyles', true);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(expressSanitizer());
  // 정적 파일 경로 설정 (선택사항)
  app.use(express.static(__dirname + '/public')); // apply css , js
  app.use(cors(corsOptionsDelegate)); // cors setting
  app.use(cookieParser());
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
  orderRoutes(app);

  app.get('/', (req, res) => {
    return res.sendFile(__dirname + '/views/index.html');
  });

  app.get('/users/login/redirect', (req, res) => {
    return res.render('auth/redirect_login.ejs', {
      message: '세션이 만료되었습니다. 다시 로그인 해 주세요.',
      cateId: 'redirectLogin',
    });
  });

  app.get('/token/refresh', async (req, res) => {
    const redirectURI = req.query.redirect_uri || '/stores';
    try {
      const tokenRes = await refresh(req, res);

      if (!tokenRes.ok) {
        return res.render('auth/redirect_login.ejs', {
          message: '다시 로그인 해 주세요.',
          cateId: 'redirectLogin',
        });
      }
      const newAccessToken = tokenRes.data.newAccessToken;
      const refreshToken = tokenRes.data.newRefreshToken;
      setToken(res, tokenRes.data.user, newAccessToken, refreshToken);

      return res.redirect(redirectURI);
    } catch (error) {
      console.log(error);
      return res.render('auth/redirect_login.ejs', {
        message: '다시 로그인 해 주세요.',
        cateId: 'redirectLogin',
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
      try {
        if (tokenRes.status === 200) {
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

          if (!user || user === null) {
            // 유저 생성에 실패하였을 경우
            return res.status(500).json({
              ok: false,
              message: '유저 생성실패 !',
            });
          }
        }

        user.cafe24RefreshToken = tokenRes.data.refresh_token;
        setCafe24AccessToken(res, tokenRes.data.access_token);
        user.generateToken((accessToken, refreshToken) => {
          setToken(res, user, accessToken, refreshToken);
        });

        return res.status(200).json({ ok: true, message: '정상적으로 처리되었습니다.' });
      } catch (error) {
        return res.status(404).json({ ok: false, message: '유저를 찾을수 없습니다.', error: error, user });
      }
    } catch (error) {
      //cafe24 access token 요청 에 실패하였을 경우
      console.error(error);
      return res.status(400).json({ ok: false, message: 'cafe24 access token 요청 실패!', error: error });
    }
  });

  app.get('/test', (req, res) => {
    return res.sendFile(__dirname + '/public/test.html');
  });

  app.get('/storemap', (req, res) => {
    const kakaoKey = req.query.key;
    if (!kakaoKey) {
      return res.status(500).json({ ok: false });
    }

    return res.send(
      `<!DOCTYPE html>` +
        `<html lang="ko" style="overflow: hidden">` +
        `<head>` +
        `<meta charset="UTF-8" />` +
        `<meta http-equiv="X-UA-Compatible" content="IE=edge" />` +
        `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` +
        `<link rel="stylesheet" type="text/css" href="/css/stores/store_pickup.css" />` +
        `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.css" />` +
        `<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>` +
        `<script src="https://cdn.jsdelivr.net/npm/swiper@9/swiper-bundle.min.js"></script>` +
        `</head>` +
        `<body>` +
        `<div class="loading" id="pickUpStoreBtn">` +
        `<div class="guard"></div>` +
        `</div>` +
        `<div id="pickupStore">` +
        `<div class="search_store_pkup_ct">` +
        `<div class="head">` +
        `<div class="search_type on" data-type="store">매장 검색</div>` +
        `<div class="search_type" data-type="dong">동단위 검색</div>` +
        `</div>` +
        `<div class="search_box">` +
        `<input id="address" type="text" placeholder="검색할 주소" value="" />` +
        `<i id="submit" class="xi-search"></i>` +
        `<div id="searchListCt"></div>` +
        `</div>` +
        `</div>` +
        `<div class="store_list_ct on">` +
        `<div class="swiper-container">` +
        `<div class="store-info-container swiper-wrapper"></div>` +
        `<div class="cont">` +
        `<div class="swiper-button-prev"></div>` +
        `<div class="swiper-pagination"></div>` +
        `<div class="swiper-button-next"></div>` +
        `</div>` +
        `</div>` +
        `</div>` +
        `<div id="mapTitle">` +
        `<div class="title">` +
        `<div class="selected_store_name">` +
        `<span class="pickup_store">픽업 매장</span>` +
        `<span id="storeName"></span>` +
        `</div>` +
        `<div>` +
        `<span id="storeAddress"></span>` +
        `</div>` +
        `</div>` +
        `</div>` +
        `<div id="map" style="display: none; width: 100%; height: 300px; position: relative; overflow: hidden; visibility: hidden; opacity: 0" ></div>` +
        `</div>` +
        `</body>` +
        `<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}"></script>` +
        `<script type="text/javascript" src="js/testCreateStorePickup.js"></script>` +
        `</html>`
    );
  });

  app.get('/storemap/iframe', cafe24Auth, async (req, res) => {
    const origin = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8080' : 'https://storemap.store';
    try {
      const user = await User.findOne({ _id: req.userId });
      const kakaoKey = user.kakao_key;
      return res.send(`"${origin}/storemap?key=${kakaoKey}"`);
    } catch (error) {
      console.error(error);
      return res.send({ ok: false, error: error });
    }
  });

  app.get('/oauth', (req, res) => {
    return console.log(req);
  });
};

app.listen();

const appStart = async () => {
  await setAdminJs(app);
  await appInit();
  await connectDB();

  appRouting();
};

const init = () => {
  appStart();
};

init();
