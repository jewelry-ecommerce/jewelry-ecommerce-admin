import type {AdminUser} from '@/apis/auth/auth.interface';
export function isGuestUser(user:AdminUser|null):boolean{return user===null;}
