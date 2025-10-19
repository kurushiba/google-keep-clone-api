import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import datasource from './datasource';
import setCurrentUser from './middleware/set-current-user';
import authController from './modules/auth/auth.controller';
import noteController from './modules/notes/note.controller';
import labelController from './modules/labels/label.controller';

const app = express();
const PORT = process.env.PORT || 8888;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイル配信（画像アップロード用）
app.use('/uploads', express.static('uploads'));

// 認証ミドルウェア
app.use(setCurrentUser);

// ルーティング
app.use('/auth', authController);
app.use('/notes', noteController);
app.use('/labels', labelController);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// データベース接続とサーバー起動
datasource
  .initialize()
  .then(() => {
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });
