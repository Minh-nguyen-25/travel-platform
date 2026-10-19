import { Prisma } from '@prisma/client';
import prisma from '../config/db';
import { HTTP_STATUS } from '../constants';
import { AiChatInput, AiChatResult } from '../types/ai.types';
import { AppError } from '../utils/app-error';
import { aiService } from './ai.service';
import { createAiDraftProof } from '../utils/ai-draft.utils';

const missing = () => new AppError('Không tìm thấy cuộc trò chuyện', HTTP_STATUS.NOT_FOUND);

export const conversationService = {
  list(userId: number) {
    return prisma.aiConversation.findMany({
      where: { userId }, orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }], take: 100,
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
  },

  async get(userId: number, id: string) {
    const conversation = await prisma.aiConversation.findFirst({
      where: { id, userId },
      include: { messages: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } },
    });
    if (!conversation) throw missing();
    // Stored drafts remain usable after the original short-lived proof expires.
    for (const message of conversation.messages) {
      const result = message.result as unknown as AiChatResult | null;
      const draft = result?.draft?.tripDraft;
      if (draft) draft.aiProofToken = createAiDraftProof(userId, draft, draft.aiRawData);
    }
    return conversation;
  },

  async remove(userId: number, id: string) {
    const result = await prisma.aiConversation.deleteMany({ where: { id, userId } });
    if (!result.count) throw missing();
  },

  async chat(userId: number, input: AiChatInput & { conversationId?: string }) {
    // Only server-owned history is trusted. A new conversation starts empty.
    const conversation = input.conversationId
      ? await this.get(userId, input.conversationId) : null;
    const history = (conversation?.messages ?? []).slice(-12).map(({ role, content }) => ({
      role: role as 'user' | 'assistant', content: content.slice(0, 4_000),
    }));
    const result: AiChatResult = await aiService.chat(userId, {
      message: input.message, locale: input.locale, history,
    });
    const now = new Date();
    const messages = [
      { role: 'user', content: input.message, createdAt: now },
      { role: 'assistant', content: result.reply, result: result as unknown as Prisma.InputJsonValue,
        createdAt: new Date(now.getTime() + 1) },
    ];
    const stored = await prisma.$transaction(async (tx) => {
      if (!conversation) {
        return tx.aiConversation.create({ data: {
          userId, title: input.message.slice(0, 100), messages: { create: messages },
        } });
      }
      const claimed = await tx.aiConversation.updateMany({
        where: { id: conversation.id, userId, updatedAt: conversation.updatedAt },
        data: { updatedAt: new Date(Math.max(Date.now(), conversation.updatedAt.getTime() + 1)) },
      });
      if (claimed.count !== 1) {
        throw new AppError('Cuộc trò chuyện đã thay đổi. Hãy mở lại trước khi gửi tiếp.', HTTP_STATUS.CONFLICT);
      }
      await tx.aiMessage.createMany({ data: messages.map((message) => ({
        ...message, conversationId: conversation.id,
      })) });
      return { id: conversation.id };
    });
    return { ...result, conversationId: stored.id };
  },
};
