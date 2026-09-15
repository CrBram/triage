"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import Button from "./Button";

type TriageChatProps = {
  title?: string;
  placeholder?: string;
};

export default function TriageChat({
  title = "How are you feeling today?",
  placeholder = "Describe your current symptoms as accurately as possible.",
}: TriageChatProps) {
  const [message, setMessage] = useState("");
  const canSend = message.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    // TODO: send `message` to the triage backend
    setMessage("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-10">
      <h1>{title}</h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 rounded-card bg-white p-5 shadow-card"
      >
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none bg-transparent text-lg text-black/70 outline-none placeholder:text-black/70"
        />
        <div className="flex justify-end">
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  );
}
