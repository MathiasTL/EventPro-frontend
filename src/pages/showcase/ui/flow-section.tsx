"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType, KeyboardEvent } from "react";

import { FLOW_STEPS } from "../model/flow-steps";
import type { FlowStep } from "../model/flow-steps";
import { ChatStep } from "./flow-steps/chat-step";
import { ContractStep } from "./flow-steps/contract-step";
import { PaymentStep } from "./flow-steps/payment-step";
import { QuoteStep } from "./flow-steps/quote-step";
import { ScheduleStep } from "./flow-steps/schedule-step";

const VISUALS: Record<FlowStep["id"], ComponentType> = {
  chat: ChatStep,
  quote: QuoteStep,
  payment: PaymentStep,
  contract: ContractStep,
  schedule: ScheduleStep,
};

function FlowVisual({ id }: { id: FlowStep["id"] }) {
  const Visual = VISUALS[id];
  return <Visual />;
}

export function FlowSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const articleRefs = useRef<(HTMLElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!window.IntersectionObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        const index = Number((visible.target as HTMLElement).dataset.flowIndex);
        if (Number.isInteger(index)) setActiveIndex(index);
      },
      { rootMargin: "-24% 0px -42% 0px", threshold: [0, 0.25, 0.5, 0.75] },
    );

    articleRefs.current.forEach((article) => {
      if (article) observer.observe(article);
    });

    return () => observer.disconnect();
  }, []);

  function goToStep(index: number, focusButton = false) {
    const next = Math.max(0, Math.min(FLOW_STEPS.length - 1, index));
    setActiveIndex(next);
    if (focusButton) buttonRefs.current[next]?.focus({ preventScroll: true });

    const article = articleRefs.current[next];
    if (!article) return;
    const headerHeight = document.querySelector(".showcase-header")?.getBoundingClientRect().height ?? 0;
    const stepperHeight = document.querySelector(".flow-stepper")?.getBoundingClientRect().height ?? 0;
    const top = window.scrollY + article.getBoundingClientRect().top - headerHeight - stepperHeight - 24;
    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  }

  function handleStepKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = FLOW_STEPS.length - 1;
    if (next === null) return;

    event.preventDefault();
    goToStep(next, true);
  }

  const activeStep = FLOW_STEPS[activeIndex];

  return (
    <section id="flujo" className="showcase-flow" aria-labelledby="flow-title">
      <div className="showcase-flow-inner">
        <div className="showcase-flow-heading">
          <h2 id="flow-title">Del chat al escenario.</h2>
          <p>Sigue cómo una consulta se convierte en un evento programado, con decisiones humanas donde importan.</p>
        </div>

        <div className="flow-stepper" role="group" aria-label="Pasos del recorrido">
          {FLOW_STEPS.map((step, index) => (
            <button
              key={step.id}
              ref={(element) => { buttonRefs.current[index] = element; }}
              type="button"
              aria-label={`Paso ${index + 1}: ${step.title}`}
              aria-controls={`flow-${step.id}`}
              aria-current={activeIndex === index ? "step" : undefined}
              onClick={() => goToStep(index)}
              onKeyDown={(event) => handleStepKeyDown(event, index)}
            >
              <span className="flow-stepper-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="flow-stepper-label">{step.title}</span>
            </button>
          ))}
        </div>

        <div className="flow-layout">
          <div className="flow-stage">
            <div key={activeStep.id} className="flow-desktop-visual">
              <FlowVisual id={activeStep.id} />
            </div>
            <p className="flow-stage-note">Secuencia ilustrativa · valores de la demostración</p>
          </div>

          <div className="flow-reading">
            {FLOW_STEPS.map((step, index) => (
              <article
                key={step.id}
                id={`flow-${step.id}`}
                ref={(element) => { articleRefs.current[index] = element; }}
                data-flow-index={index}
                data-active={activeIndex === index ? "true" : undefined}
                className="flow-article"
              >
                <div className="flow-article-copy">
                  <span className="flow-article-count" aria-hidden="true">{String(index + 1).padStart(2, "0")} / 05</span>
                  <h3>{step.title}</h3>
                  <p>{step.caption}</p>
                </div>
                <div className="flow-inline-visual">
                  <FlowVisual id={step.id} />
                  <p className="flow-stage-note">Secuencia ilustrativa · valores de la demostración</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
