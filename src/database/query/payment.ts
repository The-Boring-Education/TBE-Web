import { Payment } from '@/database';
import type { AddPaymentToDBRequestPayloadProps, DatabaseQueryResponseType } from '@/interfaces';

const addPaymentToDB = async ({
  userId,
  productId,
  productType,
  amount,
  orderId,
  paymentLink,
}: AddPaymentToDBRequestPayloadProps): Promise<DatabaseQueryResponseType> => {
  try {
    const payment = new Payment({
      user: userId,
      productId,
      productType,
      amount,
      orderId,
      paymentLink,
      isPaid: false,
    });

    await payment.save();
    return { data: payment };
  } catch (error) {
    return { error: 'Failed to save payment to DB' };
  }
};

export { addPaymentToDB };
