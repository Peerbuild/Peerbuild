export const prerender = false;
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
  // Do something with the data, then return a success response
  try {
    const checkAlreadySubmittedResponse = await fetch(
      "https://api.notion.com/v1/search",
      {
        method: "POST",
        body: JSON.stringify({
          query: email,
          filter: {
            value: "page",
            property: "object",
          },
        }),
        headers: {
          Authorization: "Bearer " + import.meta.env.NOTION_TOKEN,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
      }
    );
    const hasAlreadySubmitted = !!(
      await checkAlreadySubmittedResponse.json()
    ).results.find((result: any) => {
      return result.properties.Name.title[0].plain_text === email;
    });

    if (hasAlreadySubmitted) {
      return new Response(
        JSON.stringify({
          message: "You have already subscribed",
        }),
        { status: 400 }
      );
    }

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: {
          database_id: "7486b7b307164596a8f98ca7243ef3ca",
        },
        icon: {
          emoji: "✉️",
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: result.data,
                },
              },
            ],
          },
        },
      }),
      headers: {
        Authorization: "Bearer " + import.meta.env.NOTION_TOKEN,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
    });
    const { status, ...data } = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(data));
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
