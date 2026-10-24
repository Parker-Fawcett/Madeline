"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addVisited } from "@/lib/storage";

interface SectionContent {
  title: string;
  subtitle: string;
  icon: string;
  body: (string | { type: "track"; title: string; artist: string } | { type: "quote"; text: string; author?: string; authorImage?: string; detail?: string })[];
}

export const sections: Record<string, SectionContent> = {
  story: {
    title: "The Canyon Drive",
    subtitle: "how we started",
    icon: "♡",
    body: [
      "It wasn't that long ago. I remember begging my parents to let me go because you were different. You were the only person I wanted to talk to, the only one whose texts I got excited about. I still light up when your name pops up on my phone.",
      "I remember you picking me up, telling me you already had the directions, and then taking us up that hill to nowhere.",
      "You played your music as loud as it would go, not caring about anything, and it turned into one of the most fun times of my life. I don't know how my speakers survived it.",
      "I remember laughing so hard over the steering wheel, and looking over, and seeing the prettiest girl in the world.",
    ],
  },
  memories: {
    title: "Inside Jokes & Favorites",
    subtitle: "memories",
    icon: "♢",
    body: [
      { type: "quote" as const, text: "Fugglers", authorImage: "/images/fuggler.jpg", detail: "I remember finding out you liked them — I think you were talking about it to Kaydee, or to her. And I remember thinking, \"these are so ugly.\" I remembered seeing them at my work, but I didn't think much of it at the time. Then I got you your first one — it turned out to be the leopard one. It's crazy that after this whole collection, he's still your favorite. And he'll always be my favorite too, because he's the one that started it — a little thing I could give you to show my love for you." },
      { type: "quote" as const, text: "Taco Bell", authorImage: "/images/taco-bell.png", detail: "I had never really been to Taco Bell before, like you know my family and it for some reason haha. And I remember that first time we went to the one by my house and I think we both remember the Baja Blast, the burritos falling apart, it was so stupid. I remember you sitting there like genuinely worried and you apologizing and being so cute and feeling bad, and it was so funny because I thought the food was still good and you were like genuinely horrified. And it's just funny writing this, realizing we have never gone back there and we still hate on it to this day hahaha" },
      { type: "quote" as const, text: "drives", authorImage: "/images/drives.jpg", detail: "These are genuinely my favorite activity I've ever done with you. It's funny, I don't know why, but they just stick in my head — I can recall so many of them with you, and it feels like so much big stuff has happened in that car. It's funny, when I crashed it, your main worry wasn't that I was getting an upgrade — it was that I was losing those memories. And now that I'm thinking about it, I'd genuinely be crying right now thinking about all the amazing times we've had in that car if it were gone. So it's a good thing we'll have it for a long time more." },
      { type: "quote" as const, text: "Giraffe Cookie", authorImage: "/images/giraffe-plush.webp", detail: "I know we never got the giraffe you actually wanted. But one of those trips, I got you a monkey instead, and it turned into one of the most sentimental things, just for me personally. Seeing how much you love him, after I got him for you. Seeing you always with him. I don't know why I'm tearing up writing all of these. I'm just so happy you like him and value him, even though he wasn't what we were originally looking for." },
      { type: "quote" as const, text: "Parker", authorImage: "/images/parker.png", detail: "I know I definitely don't know Parker as well as you do, but I'm still so happy I get to be with him. He genuinely is, I know you say this as a joke, but I think of him as the dog I've never had. He's the only dog I feel semi-close to. And when he sits with us, it's just so cute." },
      { type: "quote" as const, text: "Pinto", authorImage: "/images/pinto.png", detail: "Aww, Pinto where do I even start. He's so cute, and still one of my favorite pictures is you holding him up next to you in your bed. He's so cute, but you really do carry the picture. And I don't care what anyone says, he's not fat — God forbid, he's just a little hairy. He doesn't even eat that much, haha. Parker's the one barking at everything. But he's so cute." },
      { type: "quote" as const, text: "The Boot", author: "👢", detail: "I know this is from a while back, your boot phase — but I found you so funny for it. This is my way of referencing just how funny you've always been to me. I used to genuinely laugh so hard inside every time you'd say it. I never got over how funny it was, and I'll never get over how funny and clever you are, every single day." },
    ],
  },
  quote: {
    title: "I Love You",
    subtitle: "the favorite words in the world to this day to hear",
    icon: "♤",
    body: [
      { type: "quote" as const, text: "I Love You", author: "— Madeline" },
    ],
  },
  letter: {
    title: "No Jokes, Just This",
    subtitle: "a letter",
    icon: "♧",
    body: [
      "Madeline, my girl.",
      "I know I glaze you a lot, but I don't say the things I actually need to say. I can never find the words, the words that I genuinely feel about you. I don't think they're there. I don't think they exist. And I can't even get close. But I will always try. I will always try to either tell you or show you what you mean to me.",
      "Because at this point, I'm not me without you. You influence so much of who I am. You make me so much of a better person. You are my idol. You are my model. You are my love.",
      "I want those words to land with you as much as they land with me because God, you mean so much to me.",
      "I love you, baby girl.",
    ],
  },
  playlist: {
    title: "Songs That Remind Me of You",
    subtitle: "our playlist",
    icon: "♪",
    body: [
      { type: "track" as const, title: "Teenage Dream", artist: "Katy Perry" },
      { type: "track" as const, title: "Treat You Better", artist: "Shawn Mendes" },
      { type: "track" as const, title: "The One That Got Away", artist: "Katy Perry" },
      { type: "track" as const, title: "Heart Attack", artist: "Demi Lovato" },
      { type: "track" as const, title: "You Belong With Me", artist: "Taylor Swift" },
      { type: "track" as const, title: "Sodium", artist: "BONES" },
      { type: "track" as const, title: "Burgundy", artist: "$uicideboy$" },
      { type: "track" as const, title: "Antarctica", artist: "$uicideboy$" },
      { type: "track" as const, title: "Forever", artist: "Lewis Capaldi" },
      { type: "track" as const, title: "Hold Me While You Wait", artist: "Lewis Capaldi" },
      { type: "track" as const, title: "I Found", artist: "Amber Run" },
      { type: "track" as const, title: "Control", artist: "Zoe Wees" },
    ],
  },
  reveal: {
    title: "One More Thing",
    subtitle: "save this for last",
    icon: "★",
    body: [
      "I don't care what anyone says about the honeymoon phase ending.",
      "I am more in love with you than I'll ever be able to show you.",
      "You are the light of my life. You are my everything.",
    ],
  },
};

function MemoryCard({
  text,
  author,
  authorImage,
  detail,
}: {
  text: string;
  author?: string;
  authorImage?: string;
  detail?: string;
}) {
  const [flipped, setFlipped] = useState(false);

  const front = (
    <>
      {authorImage ? (
        <img src={authorImage} alt={text} className="h-16 w-16 object-contain" />
      ) : (
        <span className="text-3xl">{author}</span>
      )}
      <p className="text-sm text-[#2e2a24]">{text}</p>
    </>
  );

  if (!detail) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-[#cbc0b2] bg-[#efe6d6] px-4 py-5 text-center">
        {front}
      </div>
    );
  }

  return (
    <div
      className="relative h-52 cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border border-[#cbc0b2] bg-[#efe6d6] px-4 py-5 text-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-[#cbc0b2] bg-[#efe6d6] px-4 py-4 text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="max-h-full overflow-y-auto text-xs leading-relaxed text-[#2e2a24]">
            {detail}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function ContentOverlay({
  sectionId,
  onClose,
}: {
  sectionId: string | null;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionId) {
      addVisited(sectionId);
    }
  }, [sectionId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // prevent scroll on body when overlay is open
  useEffect(() => {
    if (sectionId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sectionId]);

  const section = sectionId ? sections[sectionId] : null;

  return (
    <AnimatePresence>
      {section && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-3xl border border-[#cbc0b2] bg-[#f5f0e8] px-5 pt-6 pb-10"
          >
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-[#cbc0b2]" />

            <button
              onClick={onClose}
              className="absolute right-5 top-6 text-[#8a7f6e] hover:text-[#2e2a24] transition-colors"
            >
              ✕
            </button>

            <p className="text-xs uppercase tracking-[0.25em] text-[#8a7f6e]">
              {section.subtitle}
            </p>
            <h2 className="font-serif text-2xl text-[#2e2a24] mt-1">
              {section.title}
            </h2>
            <div className="mt-2 h-px w-12 bg-[#6b8f87]" />

            <div className="mt-6 space-y-4">
              {section.body.map((item, i) => {
                if (typeof item === "string") {
                  return (
                    <p key={i} className="text-sm leading-[1.8] text-[#8a7f6e]">
                      {item}
                    </p>
                  );
                }
                if (item.type === "track") {
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-[#cbc0b2] bg-[#efe6d6] px-4 py-3"
                    >
                      <span className="w-5 text-right text-xs text-[#a89e8f]">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-[#2e2a24]">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-[#8a7f6e]">
                          {item.artist}
                        </p>
                      </div>
                    </div>
                  );
                }
                if (item.type === "quote") {
                  return (
                    <MemoryCard
                      key={i}
                      text={item.text}
                      author={item.author}
                      authorImage={item.authorImage}
                      detail={item.detail}
                    />
                  );
                }
                return null;
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
