import { useLoaderData } from "@remix-run/react";
import { RavelryPattern } from "~/types";
import Image from "~/components/base/Image";

// Define types for expected data (adapt as needed based on Ravelry API response)

type LoaderData = {
  patterns: RavelryPattern[];
};

export async function loader() {
  const API_BASE_URL = process.env.API_BASE_URL;
  const READ_ONLY_USERNAME = process.env.READ_ONLY_USERNAME;
  const READ_ONLY_PASSWORD = process.env.READ_ONLY_PASSWORD;

  if (!API_BASE_URL || !READ_ONLY_USERNAME || !READ_ONLY_PASSWORD) {
    throw new Error("Missing required environment variables."); //
  }

  const endpoint = "patterns/search.json";
  const searchParams = new URLSearchParams({
    craft: "knitting",
    query: "sweater",
    sort: "favorites",
    language: "en",
    photo: "yes",
    availability: "ravelry|inprint|online|free",
  });
  const url = `${API_BASE_URL}${endpoint}?${searchParams}`;

  const headers = new Headers({
    Authorization: `Basic ${btoa(
      `${READ_ONLY_USERNAME}:${READ_ONLY_PASSWORD}`
    )}`,
  });

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      // Handle API errors appropriately
      throw new Response("Failed to fetch data", { status: 500 });
    }

    const data: LoaderData = await response.json();

    // Single Fetch: Return raw data instead of using json() [1]
    return data;
  } catch (error) {
    console.error("Error fetching patterns:", error);
    throw error; // Re-throw the error to trigger the error boundary
  }
}

export default function Index() {
  // Use the loader data in your component
  const { patterns } = useLoaderData<typeof loader>();

  return (
    <main className="grid grid-flow-dense grid-cols-1 md:grid-cols-2 xlg:grid-cols-3 gap-2 p-2xl mx-auto w-fit">
      {patterns.map((pattern: RavelryPattern, index: number) => {
        return (
          pattern.first_photo?.medium2_url && (
            <div
              key={`${pattern.id}-${index}`}
              className="relative overflow-hidden w-[600px] aspect-square rounded-lg mb-2 group "
            >
              <Image
                src={pattern.first_photo.medium2_url}
                alt={pattern.first_photo.caption || ""}
                thumbNail={pattern.first_photo.small_url}
              />
              <div className="z-20 opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 text-center py-40 px-20">
                <a
                  href={`http://www.ravelry.com/patterns/library/${pattern.permalink}`}
                  target="_blank"
                  rel="noReferrer"
                >
                  <h2 className="text-4xl font-serif">{pattern.name}</h2>
                </a>
                <h3 className="text-xl">{pattern.designer.name}</h3>
              </div>
            </div>
          )
        );
      })}
    </main>
  );
}
