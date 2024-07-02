export const prerender = false;
import { getFormattedDate } from "@/lib/utils";
import type { APIRoute } from "astro";
import { z } from "astro/zod";

const emailSchema = z.string().email({ message: "Please enter a valid email" });

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const { email } = body;
  // Validate the data - you'll probably want to do more than this
  const result = emailSchema.safeParse(email);

  if (!result.success) {
    return new Response(
      JSON.stringify({
        message: result.error,
      }),
      { status: 400 }
    );
  }
  const BUCKET_SLUG = "peerbuild-production";
  // Do something with the data, then return a success response
  try {
    const checkAlreadySubmittedResponse = await fetch(
      `https://api.cosmicjs.com/v3/buckets/${BUCKET_SLUG}/objects?` +
        new URLSearchParams({
          query: JSON.stringify({
            type: "emails",
            $and: [{ title: email }],
          }),
          read_key: import.meta.env.READ_KEY,
          props: "slug,title,metadata",
        })
    );

    if (checkAlreadySubmittedResponse.ok) {
      return new Response(
        JSON.stringify({
          message: "You have already subscribed",
        }),
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.cosmicjs.com/v3/buckets/${BUCKET_SLUG}/objects`,
      {
        method: "POST",
        body: JSON.stringify({
          title: email,
          type: "emails",
          metadata: {
            submitted_at: getFormattedDate(),
          },
        }),
        headers: {
          Authorization: "Bearer " + import.meta.env.WRITE_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) {
      throw new Error(JSON.stringify({ message: "Something went wrong!" }));
    }
  } catch (error: any) {
    return new Response(error.message, { status: 401 });
  }
  return new Response(
    JSON.stringify({
      message: "Success!",
    }),
    { status: 200 }
  );
};
