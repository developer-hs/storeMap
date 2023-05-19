import express from 'express';
import cors from 'cors';
import fs from 'fs';
import cheerio from 'cheerio';
import expressSanitizer from 'express-sanitizer';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';

import getAdminJs from './admin.js';
import db from './app/mongodb/models/index.js';
import userRoutes from './app/users/routes/index.js';
import storeRoutes from './app/stores/routes/index.js';
import { __dirname } from './api/utils.js';

import { User } from './app/users/models/user.js';
import { Store } from './app/stores/models/store.js';

process.env.NODE_ENV =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() == 'production'
    ? 'production'
    : 'development';

export const app = express();

const allowlist = [
  'http://localhost:8080',
  'https://localhost:8000',
  'https://rlagudtjq2016.cafe24.com',
];

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

const appInit = async () => {
  app.use(expressLayouts); // EJS LAYOUT
  app.set('view engine', 'ejs'); // 템플릿 엔진 설정
  app.set('views', path.join(__dirname, 'views'));
  // 레이아웃 파일 경로 설정 (선택사항)
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

  // const storeList = {
  //   1: {
  //     sc_name: "대학로점",
  //     receive_addr:
  //       "서울특별시 종로구 창경궁로 240-7 (명륜4가) 1층 오늘,와인한잔 대학로점",
  //   },
  //   2: {
  //     sc_name: "예술의전당점",
  //     receive_addr:
  //       "서울특별시 서초구 반포대로 38 (서초동) 1층 오늘,와인한잔 예술의전당점",
  //   },
  //   3: {
  //     sc_name: "교대점",
  //     receive_addr:
  //       "서울특별시 서초구 반포대로26길 75 (서초동) 오늘,와인한잔 교대점",
  //   },
  //   4: {
  //     sc_name: "방배점",
  //     receive_addr:
  //       "서울특별시 서초구 효령로31길 23 (방배동) 오늘,와인한잔 방배점",
  //   },
  //   5: {
  //     sc_name: "당산역점",
  //     receive_addr:
  //       "서울특별시 영등포구 당산로 205 (당산동5가) 당산역해링턴타워 1층 오늘,와인한잔 당산역점",
  //   },
  //   6: {
  //     sc_name: "사당점",
  //     receive_addr:
  //       "서울특별시 서초구 방배천로4길 15 (방배동) 오늘,와인한잔 사당점",
  //   },
  //   7: {
  //     sc_name: "대학로점",
  //     receive_addr:
  //       "서울특별시 종로구 창경궁로 240-7 (명륜4가) 1층 오늘,와인한잔 대학로점",
  //   },
  //   8: {
  //     sc_name: "예술의전당점",
  //     receive_addr:
  //       "서울특별시 서초구 반포대로 38 (서초동) 1층 오늘,와인한잔 예술의전당점",
  //   },
  //   9: {
  //     sc_name: "교대점",
  //     receive_addr:
  //       "서울특별시 서초구 반포대로26길 75 (서초동) 오늘,와인한잔 교대점",
  //   },
  //   10: {
  //     sc_name: "방배점",
  //     receive_addr:
  //       "서울특별시 서초구 효령로31길 23 (방배동) 오늘,와인한잔 방배점",
  //   },
  // };

  // const userId = "6465a7704164eac2ff0c2c43";

  // try {
  //   const user = await User.findById(userId);
  //   console.log(user);
  //   if (!user) {
  //     throw new Error("User not found");
  //   }

  //   for (let key in storeList) {
  //     const newStore = new Store({
  //       name: storeList[key].sc_name,
  //       addr: storeList[key].receive_addr,
  //       useStatus: true,
  //       user: user._id,
  //     });

  //     try {
  //       const store = await newStore.save();
  //       console.log("Store created successfully:", store);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  // } catch (err) {
  //   console.error(err);
  // }
};

const appRouting = () => {
  userRoutes(app);
  storeRoutes(app);
  app.get('/', (req, res) => {
    fs.readFile(
      __dirname + '/routes/stores/store_pickup.html',
      'utf8',
      (err, data) => {
        if (err) throw err;
        const $ = cheerio.load(data);
        const body = $('body').html();
        res.send(body);
      }
    );
  });

  app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/routes/stores/store_pickup.html');
  });

  app.get('/oauth', (req, res) => {
    console.log(req);
  });

  app.get('/store_map', (req, res) => {
    res.render('stores/store_map.ejs', { title: 'StoreMap' });
  });
};

app.listen();

const appStart = async () => {
  await appInit();
  connectDB();
  appRouting();
};

const init = () => {
  appStart();
};

init();
