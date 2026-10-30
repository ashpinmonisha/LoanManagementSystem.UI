import { HttpContextToken } from '@angular/common/http';

export const CUSTOMER_PORTAL_REQUEST = new HttpContextToken<boolean>(() => false);
