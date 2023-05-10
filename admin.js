import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import mongoose from "mongoose";
import { Category } from "./app/mongodb/category/model/model.js";

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

/**
 * @description adminJs Setting
 * @returns {Object}
 */
const getAdminJs = async () => {
  await mongoose.connect(
    "mongodb://khs:as731585!@localhost:27017/store_map?authMechanism=DEFAULT&authSource=admin"
  );
  const adminOptions = {
    // We pass Category to `resources`
    resources: [Category],
  };
  // Please note that some plugins don't need you to create AdminJS instance manually,
  // instead you would just pass `adminOptions` into the plugin directly,
  // an example would be "@adminjs/hapi"
  const admin = new AdminJS(adminOptions);
  const adminRouter = AdminJSExpress.buildRouter(admin);
  const adminJs = { admin, adminRouter };

  return adminJs;
};

export default getAdminJs;
