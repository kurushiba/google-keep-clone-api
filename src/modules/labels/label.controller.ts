import { Router, Request, Response } from 'express';
import datasource from '../../datasource';
import { Label } from './label.entity';
import { Auth } from '../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

const labelController = Router();
const labelRepository = datasource.getRepository(Label);

// ラベル一覧取得
labelController.get('/', Auth, async (req: Request, res: Response) => {
  try {
    const labels = await labelRepository.find({
      where: { userId: req.currentUser!.id },
      order: { createdAt: 'ASC' },
    });

    res.status(200).json(labels);
  } catch (error) {
    console.error('Get labels error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ラベル作成
labelController.post('/', Auth, async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;

    if (!name || !color) {
      res.status(400).json({ message: 'ラベル名と色は必須です' });
      return;
    }

    // 重複チェック
    const existingLabel = await labelRepository.findOne({
      where: { userId: req.currentUser!.id, name },
    });

    if (existingLabel) {
      res.status(400).json({ message: 'このラベル名は既に使用されています' });
      return;
    }

    const label = await labelRepository.save({
      id: uuidv4(),
      userId: req.currentUser!.id,
      name,
      color,
    });

    res.status(201).json(label);
  } catch (error) {
    console.error('Create label error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ラベル更新
labelController.put('/:id', Auth, async (req: Request, res: Response) => {
  try {
    const label = await labelRepository.findOne({
      where: { id: req.params.id, userId: req.currentUser!.id },
    });

    if (!label) {
      res.status(404).json({ message: 'ラベルが見つかりません' });
      return;
    }

    const { name, color } = req.body;

    // 重複チェック（自分以外）
    if (name && name !== label.name) {
      const existingLabel = await labelRepository.findOne({
        where: { userId: req.currentUser!.id, name },
      });

      if (existingLabel) {
        res.status(400).json({ message: 'このラベル名は既に使用されています' });
        return;
      }
    }

    if (name !== undefined) label.name = name;
    if (color !== undefined) label.color = color;

    await labelRepository.save(label);

    res.status(200).json(label);
  } catch (error) {
    console.error('Update label error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ラベル削除
labelController.delete('/:id', Auth, async (req: Request, res: Response) => {
  try {
    const label = await labelRepository.findOne({
      where: { id: req.params.id, userId: req.currentUser!.id },
    });

    if (!label) {
      res.status(404).json({ message: 'ラベルが見つかりません' });
      return;
    }

    await labelRepository.remove(label);
    res.status(204).send();
  } catch (error) {
    console.error('Delete label error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

export default labelController;
