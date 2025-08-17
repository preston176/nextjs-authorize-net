import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId: id },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          error: "Transaction not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      transactionId: transaction.transactionId,
      status: transaction.status,
      amount: transaction.amount,
      cardLast4: transaction.cardLast4,
      errorMessage: transaction.errorMessage,
      createdAt: transaction.createdAt,
    });
  } catch (error) {
    console.error("[TRANSACTION_ERROR]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch transaction",
      },
      { status: 500 }
    );
  }
}
