import { Router, Request, Response } from 'express';
import datasource from '../../datasource';
import { Note } from './note.entity';
import { Label } from '../labels/label.entity';
import { Auth } from '../../lib/auth';
import { upload } from '../../lib/upload';
import { v4 as uuidv4 } from 'uuid';
import { In } from 'typeorm';

const noteController = Router();
const noteRepository = datasource.getRepository(Note);
const labelRepository = datasource.getRepository(Label);

// メモ一覧取得（ページネーション対応・検索機能統合）
noteController.get('/', Auth, async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.labels', 'label')
      .where('note.userId = :userId', { userId: req.currentUser!.id });

    // テキスト検索（タイトル・本文・ラベル名を対象）
    if (query) {
      queryBuilder.andWhere(
        '(note.title LIKE :query OR note.content LIKE :query OR label.name LIKE :query)',
        {
          query: `%${query}%`,
        }
      );
    }

    const [notes, total] = await queryBuilder
      .orderBy('note.createdAt', 'DESC')
      .addOrderBy('note.position', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    res.status(200).json({
      notes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// メモ詳細取得
noteController.get('/:id', Auth, async (req: Request, res: Response) => {
  try {
    const note = await noteRepository.findOne({
      where: { id: req.params.id, userId: req.currentUser!.id },
      relations: ['labels'],
    });

    if (!note) {
      res.status(404).json({ message: 'メモが見つかりません' });
      return;
    }

    res.status(200).json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// メモ作成
noteController.post(
  '/',
  Auth,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const { title, content, labelIds } = req.body;

      // ラベルの検証
      let labels: Label[] = [];
      if (labelIds) {
        const labelIdArray = JSON.parse(labelIds);
        if (labelIdArray.length > 0) {
          labels = await labelRepository.find({
            where: { id: In(labelIdArray), userId: req.currentUser!.id },
          });
        }
      }

      // 最大positionを取得
      const maxPositionNote = await noteRepository.findOne({
        where: { userId: req.currentUser!.id },
        order: { position: 'DESC' },
      });
      const position = maxPositionNote ? maxPositionNote.position + 1 : 0;

      const noteId = uuidv4();
      let imageUrl: string | undefined;

      // 画像ファイルがアップロードされた場合
      if (req.file) {
        // 画像URLを生成（フルパス）
        const port = process.env.PORT || 8888;
        imageUrl = `http://localhost:${port}/uploads/images/${req.file.filename}`;
      }

      const note = await noteRepository.save({
        id: noteId,
        userId: req.currentUser!.id,
        title,
        content,
        imageUrl,
        position,
        labels,
      });

      const savedNote = await noteRepository.findOne({
        where: { id: note.id },
        relations: ['labels'],
      });

      res.status(201).json(savedNote);
    } catch (error) {
      console.error('Create note error:', error);

      // multerのエラーハンドリング
      if (error instanceof Error) {
        if (error.message.includes('File too large')) {
          res
            .status(400)
            .json({ message: 'ファイルサイズは5MB以下にしてください' });
          return;
        }
        if (error.message.includes('画像ファイル')) {
          res.status(400).json({ message: error.message });
          return;
        }
      }

      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// メモ更新
noteController.put(
  '/:id',
  Auth,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const note = await noteRepository.findOne({
        where: { id: req.params.id, userId: req.currentUser!.id },
        relations: ['labels'],
      });

      if (!note) {
        res.status(404).json({ message: 'メモが見つかりません' });
        return;
      }

      const { title, content, imageUrl, labelIds, position } = req.body;

      // ラベルの更新
      if (labelIds !== undefined) {
        const labelIdArray = JSON.parse(labelIds);
        if (labelIdArray.length > 0) {
          note.labels = await labelRepository.find({
            where: { id: In(labelIdArray), userId: req.currentUser!.id },
          });
        } else {
          note.labels = [];
        }
      }

      // 画像ファイルがアップロードされた場合
      if (req.file) {
        const port = process.env.PORT || 8888;
        note.imageUrl = `http://localhost:${port}/uploads/images/${req.file.filename}`;
      }

      // その他のフィールド更新
      if (title !== undefined) note.title = title;
      if (content !== undefined) note.content = content;
      if (imageUrl !== undefined) note.imageUrl = imageUrl;
      if (position !== undefined) note.position = position;

      await noteRepository.save(note);

      const updatedNote = await noteRepository.findOne({
        where: { id: note.id },
        relations: ['labels'],
      });

      res.status(200).json(updatedNote);
    } catch (error) {
      console.error('Update note error:', error);

      // multerのエラーハンドリング
      if (error instanceof Error) {
        if (error.message.includes('File too large')) {
          res
            .status(400)
            .json({ message: 'ファイルサイズは5MB以下にしてください' });
          return;
        }
        if (error.message.includes('画像ファイル')) {
          res.status(400).json({ message: error.message });
          return;
        }
      }

      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
);

// メモ削除
noteController.delete('/:id', Auth, async (req: Request, res: Response) => {
  try {
    const note = await noteRepository.findOne({
      where: { id: req.params.id, userId: req.currentUser!.id },
    });

    if (!note) {
      res.status(404).json({ message: 'メモが見つかりません' });
      return;
    }

    await noteRepository.remove(note);
    res.status(204).send();
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

export default noteController;
