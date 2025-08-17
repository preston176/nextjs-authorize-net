import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { chargeCard } from "@/lib/authorize-net";

const paymentSchema = z.object({
  amount: z.number().positive(),
  cardNumber: z.string(),
  expirationMonth: z.string(),
  expirationYear: z.string(),
  cvv: z.string(),
  billingInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const validatedData = paymentSchema.parse(data);

    // Process payment with Authorize.net
    const result = await chargeCard({
      amount: validatedData.amount,
      cardNumber: validatedData.cardNumber,
      expirationMonth: validatedData.expirationMonth,
      expirationYear: validatedData.expirationYear,
      cvv: validatedData.cvv,
      billingInfo: validatedData.billingInfo,
    });

    // Save transaction to database
    const transaction = await prisma.transaction.create({
      data: {
        amount: validatedData.amount,
        status: result.success ? "success" : "failed",
        transactionId: result.transactionId,
        errorMessage: !result.success ? result.message : null,
        cardLast4: validatedData.cardNumber.slice(-4),
      },
    });

    return NextResponse.json({
      transactionId: transaction.transactionId,
      status: transaction.status,
      message: result.message,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("[PAYMENT_ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to process payment",
      },
      { status: 500 }
    );
  }
}
