import { usePurchaseRestore } from '../utils/use-purchase-restore';

/** Mounted once at the top of the app. Renders nothing. */
export function PurchaseRestore() {
  usePurchaseRestore();
  return null;
}
