import "server-only";
import type { DashboardSummary } from "@/types/order";
import { prisma } from "../../db/prisma";
import { dhakaDayStart, dhakaMonthStart, lastDayStarts } from "../../domain/dhakaTime";
import { orderRowSelect, toOrderRow } from "../order/order.service";

const NOT_CANCELLED = { status: { not: "CANCELLED" } } as const;

export async function dashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const todayStart = dhakaDayStart(now);
  const monthStart = dhakaMonthStart(now);
  const dayStarts = lastDayStarts(now, 7);

  const [today, newOrders, toDeliver, month, productCount, week, recent] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: todayStart }, ...NOT_CANCELLED },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.count({ where: { status: { in: ["CONFIRMED", "SHIPPED"] } } }),
    // Sales means delivered: a cancelled or fake order never inflates it.
    prisma.order.aggregate({
      where: { status: "DELIVERED", createdAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    prisma.product.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: dayStarts[0] }, ...NOT_CANCELLED },
      select: { createdAt: true },
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: orderRowSelect }),
  ]);

  const days = dayStarts.map((start) => ({ date: start.toISOString(), orders: 0 }));
  for (const { createdAt } of week) {
    const index = dayStarts.findIndex((start, i) => {
      const next = dayStarts[i + 1];
      return createdAt >= start && (!next || createdAt < next);
    });
    if (index >= 0) days[index].orders += 1;
  }

  return {
    todayOrders: today._count._all,
    todayValue: today._sum.total ?? 0,
    newOrders,
    toDeliver,
    monthSales: month._sum.total ?? 0,
    productCount,
    days,
    recent: recent.map(toOrderRow),
  };
}
