import { Router, Request, Response } from 'express';
import datasource from '../../datasource';
import { User } from '../users/user.entity';
import { compare, hash } from 'bcryptjs';
import { encodeJwt } from '../../lib/jwt';
import { v4 as uuidv4 } from 'uuid';

const authController = Router();
const userRepository = datasource.getRepository(User);

authController.post('/signup', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // バリデーション
    if (!username || !email || !password) {
      res.status(400).json({ message: 'ユーザー名、メール、パスワードは必須です' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: 'パスワードは8文字以上である必要があります' });
      return;
    }

    // 重複チェック
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'このメールアドレスは既に使用されています' });
      return;
    }

    // パスワードハッシュ化 & ユーザー作成
    const hashedPassword = await hash(password, 10);
    const user = await userRepository.save({
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
    });

    // JWT発行
    const token = encodeJwt(user.id);

    // パスワードを除外してレスポンス
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

authController.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // バリデーション
    if (!email || !password) {
      res.status(400).json({ message: 'メールとパスワードは必須です' });
      return;
    }

    // ユーザー検索
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
      return;
    }

    // パスワード検証
    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
      return;
    }

    // JWT発行
    const token = encodeJwt(user.id);

    // パスワードを除外してレスポンス
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

authController.get('/me', async (req: Request, res: Response) => {
  try {
    if (req.currentUser == null) {
      res.status(200).json(null);
      return;
    }
    const { password, ...userWithoutPassword } = req.currentUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

export default authController;
