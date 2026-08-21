// @expect TS2322 a session block cannot contain zero items
import type { SessionBlock } from '../../../src/domain/session.ts';
export const empty: SessionBlock = { name: 'Main', items: [] };
