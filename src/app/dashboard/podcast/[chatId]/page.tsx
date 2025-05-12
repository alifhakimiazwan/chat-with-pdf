"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";

const PodcastPage = () => {
  const { chatId } = useParams();
  const [script, setScript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        setIsLoading(true);

        // Step 1: Fetch existing podcast from API
        const res = await axios.post("/api/podcast", { chatId });
        if (res.data.success) {
          setScript(res.data.script);
          setAudioUrl(res.data.podcastUrl);
        } else {
          console.error("❌ Podcast generation failed:", res.data.error);
        }
      } catch (err) {
        console.error("❌ Podcast fetching failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPodcast();
  }, [chatId]);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 font-telegraf">Podcast Episode</h1>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600 dark:text-gray-300">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-sm font-telegraf">
            Loading podcast... Please wait.
          </p>
        </div>
      ) : (
        <>
          {audioUrl && (
            <div className="mb-6">
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {script && (
            <>
              <h2 className="text-lg font-semibold mb-2 font-telegraf">
                Transcript
              </h2>
              <p className="text-sm whitespace-pre-line leading-relaxed text-gray-700 dark:text-gray-300">
                {script}
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PodcastPage;
