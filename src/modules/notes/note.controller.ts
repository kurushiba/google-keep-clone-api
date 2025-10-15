import { Router, Request, Response } from 'express';
import datasource from '../../datasource';
import { Note } from './note.entity';
import { Label } from '../labels/label.entity';
import { Auth } from '../../lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { In, Like } from 'typeorm';

const noteController = Router();
const noteRepository = datasource.getRepository(Note);
const labelRepository = datasource.getRepository(Label);

// メモ一覧取得（ページネーション対応）
noteController.get('/', Auth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [notes, total] = await noteRepository.findAndCount({
      where: { userId: req.currentUser!.id },
      relations: ['labels'],
      order: { position: 'ASC', createdAt: 'DESC' },
      skip,
      take: limit,
    });

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

// メモ検索
noteController.get('/search', Auth, async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const labelIds = req.query.labels ? (req.query.labels as string).split(',') : [];
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.labels', 'label')
      .where('note.userId = :userId', { userId: req.currentUser!.id });

    // テキスト検索
    if (query) {
      queryBuilder.andWhere('(note.title LIKE :query OR note.content LIKE :query)', {
        query: `%${query}%`,
      });
    }

    // ラベルフィルタ
    if (labelIds.length > 0) {
      queryBuilder.andWhere('label.id IN (:...labelIds)', { labelIds });
    }

    const [notes, total] = await queryBuilder
      .orderBy('note.position', 'ASC')
      .addOrderBy('note.createdAt', 'DESC')
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
    console.error('Search notes error:', error);
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
noteController.post('/', Auth, async (req: Request, res: Response) => {
  try {
    const { title, content, imageUrl, labelIds } = req.body;

    if (!content) {
      res.status(400).json({ message: 'メモの内容は必須です' });
      return;
    }

    // ラベルの検証
    let labels: Label[] = [];
    if (labelIds && labelIds.length > 0) {
      labels = await labelRepository.find({
        where: { id: In(labelIds), userId: req.currentUser!.id },
      });
    }

    // 最大positionを取得
    const maxPositionNote = await noteRepository.findOne({
      where: { userId: req.currentUser!.id },
      order: { position: 'DESC' },
    });
    const position = maxPositionNote ? maxPositionNote.position + 1 : 0;

    const note = await noteRepository.save({
      id: uuidv4(),
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
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// メモ更新
noteController.put('/:id', Auth, async (req: Request, res: Response) => {
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
      if (labelIds.length > 0) {
        note.labels = await labelRepository.find({
          where: { id: In(labelIds), userId: req.currentUser!.id },
        });
      } else {
        note.labels = [];
      }
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
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

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
