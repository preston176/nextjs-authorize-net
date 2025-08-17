import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    // Get the subscription ID from the URL
    const subscriptionId = req.nextUrl.searchParams.get("id");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Get the subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        subscriptionId: subscriptionId,
        status: "active",
      },
    });

    if (!subscription?.subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    // Update subscription status in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "canceled" },
    });

    return NextResponse.json({
      status: "success",
      message: "Subscription canceled",
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
