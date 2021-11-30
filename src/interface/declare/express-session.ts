export {};
// Declaration merging on express-session
declare module 'express-session' {
  interface Session {
    accessToken: string;
    user: {
      sub: string,
      name: string,
      email_verified: boolean,
      email: string
    };
  }
}