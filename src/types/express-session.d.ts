import 'express-session';

declare module 'express-session' {
  export interface Session {
    clearSession(): Promise<void>; // DO NOT MODIFY THIS!

    authenticatedUser: {
      userId: string;
      username: string;
    };
    isAdmin: boolean;
    isPro: boolean;
    isLoggedIn: boolean;
  }
}
