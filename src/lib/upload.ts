import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// 画像の保存先とファイル名を設定
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const uploadDir = path.join('uploads', 'images');

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // タイムスタンプ_元のファイル名の形式
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}_${sanitizedName}`);
  },
});

// ファイルタイプのフィルタリング
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('画像ファイルはJPEG、PNG、GIFのみ対応しています'));
  }
};

// multer設定
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
