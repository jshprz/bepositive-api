export {};
// Declaration merging on express-session
declare module 'express-session' {
  interface Session {
    accesstoken: string;
    user: {
      sub: string,
      name: string,
      email_verified: boolean,
      email: string
    };
  }
}