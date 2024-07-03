export interface CustomRequest extends Request {
    sessionAuth: { [unit: string]: any };
    user: any;
  }