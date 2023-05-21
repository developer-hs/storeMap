import path from 'path';
export const __dirname = path.resolve();
export const createError = (res, err_msg) => {
  const error = new Error(err_msg);
  error.status = 400;
  return res.status(error.status).json({ error: error.message });
};
