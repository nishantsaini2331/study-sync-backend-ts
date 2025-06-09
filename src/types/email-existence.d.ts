declare module "email-existence" {
  const emailExistence: {
    check(email: string, callback: (err: any, exists: boolean) => void): void;
  };
  export = emailExistence;
}
