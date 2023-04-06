export interface DialogInterface {
  cancelButtonLabel: string;
  confirmButtonLabel: string;
  dialogHeader?: string;
  inputs?: any[];
  defaultTitle?: string;
  defaultDescription?: string;
  defaultUsers?: any;
  userShown?: boolean;
  desc?: boolean;
  callbackMethod: (title?: any, description?: string, users?: any[]) => void;
}
