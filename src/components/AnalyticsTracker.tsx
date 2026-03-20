"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

interface AnalyticsTrackerProps {
  portfolioId: string;
}

export default function AnalyticsTracker({ portfolioId }: AnalyticsTrackerProps) {
  useEffect(() => {
    // 1. Get or create session id
    let sessionId = sessionStorage.getItem("pf_session_id");
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem("pf_session_id", sessionId);
    }

    // 2. Track page view on initial render
    const trackPageView = async () => {
      try {
        await fetch("/api/analytics/event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "page_view",
            portfolio_id: portfolioId,
            session_id: sessionId,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
          }),
        });
      } catch (error) {
        console.error("Failed to track page view:", error);
      }
    };

    trackPageView();
  }, [portfolioId]);

  // This is a logic-only component that doesn't render anything
  return null;
}
