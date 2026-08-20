import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push-server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const subject =
    typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  // Honeypot field: real users never fill this in, only bots do.
  const company = typeof body?.company === "string" ? body.company.trim() : "";

  if (company) {
    // Silently succeed so bots don't learn anything from the response.
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }
  if (name.length > 200 || subject.length > 300 || message.length > 5000) {
    return NextResponse.json(
      { error: "One of the fields is too long." },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("contact_messages").insert({
    user_id: user?.id ?? null,
    name,
    email,
    subject: subject || null,
    message,
  });

  if (error) {
    console.error("Failed to save contact message:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  // Best-effort: let the admin know a new message came in. Never fails
  // the request if push isn't configured or the admin isn't subscribed.
  const adminUserId = process.env.CONTACT_ADMIN_USER_ID;
  if (adminUserId) {
    try {
      await sendPushToUser(adminUserId, {
        title: "New contact message",
        body: `${name}${subject ? ` — ${subject}` : ""}: ${message.slice(0, 120)}`,
        url: "/",
        tag: "contact-message",
      });
    } catch (err) {
      console.error("Failed to send contact push notification:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
