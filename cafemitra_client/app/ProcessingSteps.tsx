"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Circle, Laugh, Loader2, X } from "lucide-react";
import { apiUrl } from "@/lib/api";

// Step-by-step "work in progress" animation shared by the photo makers. The
// steps are a cosmetic, fixed-duration sequence (the real work happens on the
// server and is polled separately); the last step simply stays active until
// the real result arrives. Reuses the passport-step-* styles.

export type ProcessingStepItem = { title: string; desc: string; duration: number };
export type ProcessingGroup = { id: string; title: string; items: ProcessingStepItem[] };

// Built-in fallback. The live list is managed from the admin panel (Waiting
// Jokes) and fetched by useWaitingJokes(); this set is only used while that
// loads, if it fails, or if the admin has no active jokes.
export const WAITING_JOKES = [
  "Teacher: Tumhara homework kahan hai? Student: Sir, wo bhi AI processing me hai, thoda wait kariye.",
  "Ek printer doosre printer se bola - bhai, kaam se break chahiye. Doosra bola - tu to already jam pe hai.",
  "Pappu interview me bola: Sir mujhe multitasking aati hai. Interviewer: Example do. Pappu: Main khana khate waqt sochta hun ki kal kya khaunga.",
  "Wife: Aap mujhe kitna pyaar karte ho? Husband: Utna jitna ye passport photo load hone me time le raha hai. Wife: Ye kya jawab hua? Husband: Bas thoda aur wait karo, samajh jaogi.",
  "Ek aadmi bank me bola: Mera balance check karo. Cashier: Sir aapka balance to aapki personality jaisa hai - kam hai. Aadmi: Matlab? Cashier: Zero ke aas paas.",
  "Boss: Kaam kahan tak pahucha? Employee: Sir, AI process kar raha hai. Boss: Aur tum? Employee: Main uska result wait kar raha hun, jaise aap abhi kar rahe ho.",
  "Ek chai wala apne dost se bola: Aaj kal sabko instant chahiye. Dost: Kyun? Chai wala: Chai bhi, aur passport photo bhi.",
  "Student ne teacher se pucha: Sir AI kitna smart hai? Teacher: Itna ki tumhari copy check karne se pehle soch leta hai ki galtiyan kitni honi chahiye.",
  "Pati: Tumhe pata hai patience kya hoti hai? Patni: Haan, jaise main tumhara jawab sunne se pehle ye photo process hone ka wait kar rahi hun.",
  "Ek naya customer shop pe aaya aur bola: Jaldi karo bhai, time nahi hai. Dukaandaar: Bhaisahab, AI bhi insaan jaisa hai - jaldi karoge to result kharab aayega.",
  "Do dost baat kar rahe the: Yaar tumhara passport photo kab tak banega? Dusra: Bas thoda sabr rakh, main bhi tere jaise AI ka wait kar raha hun.",
  "Interviewer: Apni sabse badi khoobi batao. Candidate: Sir, main wait karna jaanta hun - jaise abhi is photo ka process hone ka kar raha hoon.",
  "Ek aadmi doctor ke paas gaya: Doctor sahab, mujhe patience kam hai. Doctor: Thoda ruko, report aane do, phir dawai bataunga.",
  "Beta: Papa, AI kaise kaam karta hai? Papa: Beta, jaise tum result ka wait karte ho na exam ke baad, waise hi ye bhi wait karwata hai.",
  "Teacher ne class me pucha: Fast kaam karne ka raaz kya hai? Student: Sir, jaldi karne se kabhi kabhi photo kharab ban jaati hai, isliye AI thoda time leta hai.",
  "Ek grahak ne dukaandaar se pucha: Photo itna time kyun le raha hai? Dukaandaar: Bhaisahab, achhi cheez me thoda time to lagta hi hai - jaise achhi chai banane me.",
];

let cachedJokes: string[] | null = null;

/** The admin-managed "while you wait" jokes, falling back to the built-in set. */
export function useWaitingJokes() {
  const [jokes, setJokes] = useState<string[]>(cachedJokes ?? WAITING_JOKES);

  useEffect(() => {
    if (cachedJokes) return;
    let cancelled = false;
    fetch(apiUrl("/api/waiting-jokes/"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const list: string[] = Array.isArray(data?.jokes) ? data.jokes.filter((item: unknown) => typeof item === "string" && item.trim()) : [];
        if (!list.length) return;
        cachedJokes = list;
        if (!cancelled) setJokes(list);
      })
      .catch(() => {
        // Keep the built-in set.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return jokes;
}

/** Flattens the groups and works out which step indexes belong to each. */
export function indexProcessingGroups(groups: ProcessingGroup[]) {
  const items = groups.flatMap((group) => group.items);
  let cursor = 0;
  const ranges = groups.map((group) => {
    const start = cursor;
    cursor += group.items.length;
    return { ...group, start, end: cursor - 1 };
  });
  return { items, ranges };
}

/**
 * Runs the step animation while `active` is true and resets when it turns
 * false. `stepCursor` is the index of the step currently in progress.
 */
export function useStepAnimation(groups: ProcessingGroup[], active: boolean) {
  const { items, ranges } = useMemo(() => indexProcessingGroups(groups), [groups]);
  const [stepCursor, setStepCursor] = useState(0);

  useEffect(() => {
    if (!active) {
      setStepCursor(0);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const scheduleNext = (current: number) => {
      if (current >= items.length - 1) return;
      timer = setTimeout(() => {
        if (cancelled) return;
        setStepCursor(current + 1);
        scheduleNext(current + 1);
      }, items[current].duration);
    };
    setStepCursor(0);
    scheduleNext(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [active, items]);

  const overallProgress = Math.min(92, Math.round(((stepCursor + 0.5) / items.length) * 100));
  return { stepCursor, overallProgress, ranges, totalSteps: items.length };
}

export function ProcessingTimeline({
  intro,
  ranges,
  stepCursor,
  overallProgress,
}: {
  intro: string;
  ranges: ReturnType<typeof indexProcessingGroups>["ranges"];
  stepCursor: number;
  overallProgress: number;
}) {
  return (
    <div className="passport-processing-state">
      <p>{intro}</p>
      <div className="passport-step-timeline">
        {ranges.map((group, groupIndex) => {
          const groupStatus = stepCursor > group.end ? "done" : stepCursor >= group.start ? "active" : "pending";
          return (
            <div className={`passport-step-group ${groupStatus}`} key={group.id}>
              <div className="passport-step-group-head">
                <span className="passport-step-group-icon">{groupStatus === "done" ? <Check size={14} /> : groupIndex + 1}</span>
                <strong>{group.title}</strong>
              </div>
              {groupStatus !== "pending" ? (
                <div className="passport-step-items">
                  {group.items.map((item, itemOffset) => {
                    const itemIndex = group.start + itemOffset;
                    const itemStatus = itemIndex < stepCursor ? "done" : itemIndex === stepCursor ? "active" : "pending";
                    return (
                      <div className={`passport-step-item ${itemStatus}`} key={item.title}>
                        <span className="passport-step-item-icon">
                          {itemStatus === "done" ? <Check size={14} /> : itemStatus === "active" ? <Loader2 size={14} className="passport-step-spin" /> : <Circle size={14} />}
                        </span>
                        <div>
                          <strong>{item.title}</strong>
                          <span>{item.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="passport-overall-progress">
        <div className="passport-overall-progress-label">
          <span>Overall progress</span>
          <strong>{overallProgress}%</strong>
        </div>
        <div className="passport-overall-progress-track">
          <div className="passport-overall-progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>
    </div>
  );
}

/**
 * The floating "have a joke while you wait" card. Appears 2 seconds after the
 * animation reaches step `afterStep` while `active`, and goes away with it.
 */
export function WaitingJokeWidget({ active, stepCursor, afterStep }: { active: boolean; stepCursor: number; afterStep: number }) {
  const jokes = useWaitingJokes();
  const [show, setShow] = useState(false);
  const [jokeIndex, setJokeIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!active) {
      triggeredRef.current = false;
      setShow(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (stepCursor >= afterStep && !triggeredRef.current) {
      triggeredRef.current = true;
      timerRef.current = setTimeout(() => {
        setJokeIndex(Math.floor(Math.random() * jokes.length));
        setShow(true);
      }, 2000);
    }
  }, [active, stepCursor, afterStep, jokes.length]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!show) return null;
  return (
    <div className="passport-joke-widget" role="status" aria-live="polite">
      <button type="button" className="passport-joke-close" aria-label="Dismiss" onClick={() => setShow(false)}>
        <X size={14} />
      </button>
      <div className="passport-joke-head">
        <span className="passport-joke-badge">
          <Laugh size={20} aria-hidden />
        </span>
        <span>Bas thodi der aur - ek joke sun lijiye</span>
      </div>
      <p className="passport-joke-text">
        <span className="passport-joke-quote" aria-hidden>
          &ldquo;
        </span>
        {jokes[jokeIndex % jokes.length]}
      </p>
      <div className="passport-joke-nav">
        <button type="button" onClick={() => setJokeIndex((i) => (i - 1 + jokes.length) % jokes.length)}>
          <ChevronLeft size={14} /> Prev
        </button>
        <span className="passport-joke-count">
          {(jokeIndex % jokes.length) + 1}/{jokes.length}
        </span>
        <button type="button" onClick={() => setJokeIndex((i) => (i + 1) % jokes.length)}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
