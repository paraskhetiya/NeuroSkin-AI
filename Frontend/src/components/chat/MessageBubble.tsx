import { motion } from "framer-motion";
import type { ChatMessage } from "./types";
import { Activity, User } from "lucide-react";
import { CnnTop3Card } from "./CnnTop3Card";
import { FinalResultCard } from "./FinalResultCard";

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
          isUser
            ? "bg-secondary text-foreground"
            : "bg-gradient-to-br from-cyan to-bio text-background"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Activity className="h-4 w-4" strokeWidth={3} />}
      </div>

      <div className={`flex max-w-[88%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        {msg.kind === "image" && msg.imageUrl && (
          <div className="overflow-hidden rounded-2xl border border-border">
            <img src={msg.imageUrl} alt="Uploaded skin" className="max-h-72 object-cover" />
          </div>
        )}

        {msg.kind === "text" && msg.content && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isUser ? "bg-secondary text-foreground" : "glass text-foreground"
            }`}
          >
            {msg.content}
          </div>
        )}

        {msg.kind === "cnn-top3" && msg.cnnTop3 && (
          <CnnTop3Card predictions={msg.cnnTop3} model={msg.cnnModel} />
        )}

        {msg.kind === "final" && msg.finalDiagnosis && (
          <FinalResultCard d={msg.finalDiagnosis} />
        )}
      </div>
    </motion.div>
  );
}
