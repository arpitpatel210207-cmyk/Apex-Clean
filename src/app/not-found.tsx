import Link from "next/link";

export default function NotFound() {
  const traceId = "APEX-404-A71C";
  const routeHash = "/unknown/route";

  return (
    <main className="min-h-screen bg-bg px-3 py-6 sm:px-6 sm:py-10">
      <section className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
        <div className="surface w-full max-w-[900px] rounded-[22px] p-5 sm:p-8 md:p-12">
          <div className="mx-auto max-w-[760px]">
            <div className="mb-6 rounded-2xl border border-border/60 bg-card2/30 px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-1px_0_rgba(0,0,0,0.45)]">
              <svg viewBox="0 0 760 160" className="h-[92px] w-full sm:h-[120px] md:h-[150px]">
                <path d="M16 124 H744" stroke="rgba(230,245,250,0.14)" strokeWidth="1.5" />

                <path
                  d="M24 108 L120 108 L156 106 L188 96 L218 102 L254 90 L288 98 L320 78 L348 85 L380 70 L412 78 L442 56 L468 64 L496 48"
                  fill="none"
                  stroke="#aedef1"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  className="nf-line-draw"
                />

                <path
                  d="M546 72 L578 68 L606 74 L632 68"
                  fill="none"
                  stroke="#aedef1"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  className="nf-line-draw-soft"
                />

                <g className="nf-break-fx">
                  <circle cx="520" cy="58" r="5" fill="#aedef1" />
                  <path d="M512 74 L520 62 L526 76 L534 64" stroke="#aedef1" strokeWidth="2" fill="none" strokeLinecap="round" />
                </g>
              </svg>
            </div>

            <h1 className="text-center text-[30px] font-semibold leading-none text-[#6fc4e7] sm:text-[36px] md:text-[42px]">
              404 - Trace Not Found
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[14px] text-[#e6f5fa] sm:text-[16px]">
              The requested page has no active trace in the monitored intelligence stream.
            </p>

            <div className="nf-console mx-auto mt-6 max-w-2xl rounded-xl border border-[#6fc4e7]/35 bg-[rgba(14,18,22,0.9)] p-4 text-left">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[12px] font-medium tracking-[0.08em] text-[#aedef1]">INTELLIGENCE NODE</span>
                <span className="inline-flex items-center gap-1 rounded-md border border-[#6fc4e7]/45 bg-[#6fc4e7]/15 px-2 py-1 text-[11px] font-semibold tracking-[0.04em] text-[#aedef1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6fc4e7]" />
                  ACTIVE
                </span>
              </div>

              <div className="grid gap-2 text-[12px] text-[#e6f5fa] md:grid-cols-2">
                <p><span className="text-[#aedef1]/85">Session ID:</span> <span className="font-mono">{traceId}</span></p>
                <p><span className="text-[#aedef1]/85">Status:</span> <span className="font-mono">Trace unresolved</span></p>
                <p className="md:col-span-2"><span className="text-[#aedef1]/85">Requested Path:</span> <span className="font-mono">{routeHash}</span></p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#aedef1]/35 bg-[#aedef1]/10 px-2.5 py-1 text-[11px] text-[#e6f5fa]">Pattern Signals</span>
                <span className="rounded-full border border-[#aedef1]/35 bg-[#aedef1]/10 px-2.5 py-1 text-[11px] text-[#e6f5fa]">Behavior Trace</span>
                <span className="rounded-full border border-[#aedef1]/35 bg-[#aedef1]/10 px-2.5 py-1 text-[11px] text-[#e6f5fa]">Network Watch</span>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-[#6fc4e7]/60 bg-[#6fc4e7] px-6 py-2.5 text-[16px] font-medium text-[#121212] shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition hover:brightness-110"
              >
                Back to Safety
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
