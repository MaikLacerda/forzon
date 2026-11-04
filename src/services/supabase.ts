// Compatibility for older copied project folders. Active services use Firebase.
// No Supabase SDK, project, key or database is used by this module.
export { accountClient as supabase, authError } from './firebase';
