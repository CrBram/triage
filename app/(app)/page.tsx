"use client";

import { useState } from "react";
import Content from "@/components/Content";
import TriageChat from "@/components/TriageChat";

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  return (
    <Content
      title={
        sessionId
          ? `Assessment · ID: #${sessionId}`
          : "New Triage Assessment"
      }
    >
      <TriageChat onSessionId={setSessionId} />
    </Content>
  );
}
