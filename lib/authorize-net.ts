import { APIContracts, APIControllers } from "authorizenet";

interface ChargeCardInput {
  amount: number;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  billingInfo: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface ChargeCardResult {
  success: boolean;
  transactionId: string;
  message: string;
}

const merchantAuthenticationType =
  new APIContracts.MerchantAuthenticationType();
merchantAuthenticationType.setName(
  process.env.AUTHORIZE_NET_API_LOGIN_ID || ""
);
merchantAuthenticationType.setTransactionKey(
  process.env.AUTHORIZE_NET_TRANSACTION_KEY || ""
);

export async function chargeCard(
  input: ChargeCardInput
): Promise<ChargeCardResult> {
  try {
    const creditCard = new APIContracts.CreditCardType();
    creditCard.setCardNumber(input.cardNumber);
    creditCard.setExpirationDate(
      `${input.expirationYear}-${input.expirationMonth}`
    );
    creditCard.setCardCode(input.cvv);

    const paymentType = new APIContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const billTo = new APIContracts.CustomerAddressType();
    billTo.setFirstName(input.billingInfo.firstName);
    billTo.setLastName(input.billingInfo.lastName);
    billTo.setAddress(input.billingInfo.address);
    billTo.setCity(input.billingInfo.city);
    billTo.setState(input.billingInfo.state);
    billTo.setZip(input.billingInfo.zip);
    billTo.setCountry("US");

    const transactionRequestType = new APIContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(
      APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION
    );
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setBillTo(billTo);
    transactionRequestType.setAmount(input.amount);

    const createRequest = new APIContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);

    const ctrl = new APIControllers.CreateTransactionController(
      createRequest.getJSON()
    );
    ctrl.setEnvironment(
      process.env.AUTHORIZE_NET_ENVIRONMENT === "PRODUCTION"
        ? "PRODUCTION"
        : "SANDBOX"
    );

    return new Promise((resolve, reject) => {
      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new APIContracts.CreateTransactionResponse(
          apiResponse
        );

        if (
          response.getMessages().getResultCode() ===
            APIContracts.MessageTypeEnum.OK &&
          response.getTransactionResponse().getTransId()
        ) {
          resolve({
            success: true,
            transactionId: response.getTransactionResponse().getTransId(),
            message: response.getMessages().getMessage()[0].getText(),
          });
        } else {
          const errorText =
            response
              .getTransactionResponse()
              ?.getErrors()?.[0]
              ?.getErrorText() || "Transaction failed";
          resolve({
            success: false,
            transactionId:
              response.getTransactionResponse()?.getTransId() || "",
            message: errorText,
          });
        }
      });
    });
  } catch (error) {
    console.error("[AUTHORIZE_NET_ERROR]", error);
    throw new Error("Failed to process payment");
  }
}
