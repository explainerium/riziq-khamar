import "server-only";
import { orderCode, formatPack, formatTaka } from "@/utils/format";
import { env } from "../../config/env";
import { prisma } from "../../db/prisma";
import { sendMail } from "../../mailer";
import { readSettings } from "../setting/setting.service";

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** Tells the shop about a new order. Runs after the response; a mail failure never affects the order. */
export async function notifyNewOrder(orderId: string): Promise<void> {
  try {
    const [order, settings] = await Promise.all([
      prisma.order.findUnique({ where: { id: orderId }, include: { items: true } }),
      readSettings(),
    ]);
    if (!order || !settings.notifyEmail) return;

    const code = orderCode(order.orderNo);
    const items = order.items.map(
      (item) => `${item.productName} (${formatPack(item.packSize, item.packUnit, "bn")}) x ${item.quantity}`,
    );
    const link = `${env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order.id}`;
    const rows = [
      ["নাম", order.customerName],
      ["ফোন", order.customerPhone],
      ["ঠিকানা", order.address],
      ["ডেলিভারি", order.deliveryLabel],
      ["মোট", formatTaka(order.total, "bn")],
    ];

    await sendMail({
      to: settings.notifyEmail,
      subject: `নতুন অর্ডার ${code}: ${formatTaka(order.total, "bn")}`,
      text: [...rows.map(([label, value]) => `${label}: ${value}`), "", ...items, "", link].join("\n"),
      html: `<h2>নতুন অর্ডার ${code}</h2>
${rows.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join("\n")}
<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
<p><a href="${link}">ড্যাশবোর্ডে দেখুন</a></p>`,
    });
  } catch (error) {
    console.error("[order] new order mail failed", error);
  }
}
