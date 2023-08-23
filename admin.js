import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import session from 'express-session';
import bcrypt from 'bcrypt';

import { User } from './app/users/models/user.js';
import { Store } from './app/stores/models/store.js';
import { Widget } from './app/widgets/models/widget.js';
import { Product } from './app/products/models/product.js';
import { Admin } from './app/admin/models/admin.js';

import passport from './passprot-setup.js';
import { ADMINJS_COOKIE_PW, ADMINJS_SESSION_SECRET } from './app/config/index.js';
/**
 * @description adminJs Setting
 * @returns {Object}
 */
const setAdminJs = async (app) => {
  AdminJS.registerAdapter(AdminJSMongoose);
  const adminOptions = {
    // We pass Category to `resources`
    resources: [{ resource: Admin, options: { properties: { password: { isVisible: false } } } }, User, Store, Widget, Product],
    rootPath: '/admin',
    loginPath: '/admin/login',
    dashboard: {},
    // 보안 옵션 추가
    authenticate: async (email, password) => {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return null;
      }

      const isValid = await bcrypt.compare(password, admin.password);

      if (!isValid) {
        return null;
      }

      return admin;
    },

    isAuthenticated: (request) => {
      return typeof request.session !== 'undefined' && request.session.admin;
    },
  };

  const adminJs = new AdminJS(adminOptions);

  app.use(session({ secret: ADMINJS_SESSION_SECRET, resave: false, saveUninitialized: true }));
  app.use(passport.initialize());
  app.use(passport.session());

  const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async (email, password) => {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (isValidPassword) {
        return admin;
      }

      return null;
    },

    isAuthenticated: (request) => {
      // 사용자가 로그인 했다면 세션에 'admin'이 있어야 합니다. 이를 확인합니다.
      return typeof request.session !== 'undefined' && request.session.admin;
    },
    cookieName: 'adminjs',
    cookiePassword: ADMINJS_COOKIE_PW,
  });

  app.use(adminJs.options.rootPath, router);

  return adminJs;
};

export default setAdminJs;
