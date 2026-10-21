import { isDevMode } from '@angular/core';

// The development server forwards same-origin requests to the local API.
export const API_BASE_URL = isDevMode() ? '/api' : 'https://localhost:7085/api';
