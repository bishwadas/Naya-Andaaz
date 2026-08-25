import { api } from './api';

// Re-export api as db for seamless compatibility while eliminating localStorage
export const db = api;
export default db;
