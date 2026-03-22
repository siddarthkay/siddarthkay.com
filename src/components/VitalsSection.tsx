import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import whoopData from "@/data/whoop-data.json";

const ease = [0.2, 0, 0, 1] as const;

function getRecoveryColor(score: number): string {
  if (score >= 67) return "#44aa99";
  if (score >= 34) return "#d4702a";
  return "#c0392b";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "less than an hour ago";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return hours + " hours ago";
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return days + " days ago";
}

function buildSparklinePath(values: number[], w: number, h: number, pad: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return { x, y };
  });

  const line = pts.map((p, i) => (i === 0 ? "M" : "L") + " " + p.x.toFixed(1) + " " + p.y.toFixed(1)).join(" ");
  const area = line + " L " + pts[pts.length - 1].x.toFixed(1) + " " + h + " L " + pts[0].x.toFixed(1) + " " + h + " Z";

  return { line, area, pts };
}

function Sparkline({ data, color, label }: { data: (number | null)[]; color: string; label: string }) {
  const values = data.filter((d): d is number => d !== null);
  if (values.length < 2) return null;

  const W = 160;
  const H = 44;
  const PAD = 4;
  const gid = "g-" + label;

  const { line, area, pts } = buildSparklinePath(values, W, H, PAD);
  const last = pts[pts.length - 1];
  const lastVal = values[values.length - 1];
  const valStr = Number.isInteger(lastVal) ? String(lastVal) : lastVal.toFixed(1);

  return (
    <svg viewBox={"0 0 " + W + " " + H} className="block overflow-visible w-full" style={{ height: H }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={"url(#" + gid + ")"} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={2.5} fill={color} />
      <text
        x={last.x + 8}
        y={last.y + 3}
        fill={color}
        fontSize={9}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight={500}
      >
        {valStr}
      </text>
    </svg>
  );
}

const latest = whoopData.latest;
const trends = whoopData.trends;
const lastWorkout = whoopData.recent_workouts?.[0] ?? null;

export default function VitalsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="vitals" className="py-24 md:py-32 px-6 md:px-8">
      <div ref={ref} className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease }}
          className="flex items-baseline gap-4 mb-14"
        >
          <span className="font-mono text-burnt text-[2.5rem] font-medium leading-none tabular-nums">
            02
          </span>
          <span className="label-mono text-slate">Vitals</span>
        </motion.div>

        {/* Stat row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease }}
          className="grid grid-cols-2 md:grid-cols-4 border border-navy/15"
        >
          {/* Recovery */}
          <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-navy/15">
            <p className="label-mono text-slate/60 mb-3">Recovery</p>
            {latest.recovery_score !== null ? (
              <>
                <p
                  className="font-mono text-3xl md:text-4xl font-medium leading-none tabular-nums"
                  style={{ color: getRecoveryColor(latest.recovery_score) }}
                >
                  {latest.recovery_score}%
                </p>
                <p className="font-mono text-xs text-slate/50 mt-2.5 leading-relaxed">
                  {latest.hrv_rmssd_milli !== null && (
                    <>HRV: {Math.round(latest.hrv_rmssd_milli)}ms</>
                  )}
                  {latest.hrv_rmssd_milli !== null && latest.resting_heart_rate !== null && (
                    <span className="mx-1.5">&middot;</span>
                  )}
                  {latest.resting_heart_rate !== null && (
                    <>RHR: {latest.resting_heart_rate}bpm</>
                  )}
                </p>
              </>
            ) : (
              <p className="font-mono text-sm text-slate/40">&mdash;</p>
            )}
          </div>

          {/* Sleep */}
          <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-navy/15">
            <p className="label-mono text-slate/60 mb-3">Sleep</p>
            {latest.total_sleep_hours !== null ? (
              <>
                <p className="font-mono text-3xl md:text-4xl font-medium leading-none tabular-nums text-navy">
                  {latest.total_sleep_hours}h
                </p>
                <p className="font-mono text-xs text-slate/50 mt-2.5">
                  {latest.sleep_performance_percentage !== null && (
                    <>Performance: {latest.sleep_performance_percentage}%</>
                  )}
                </p>
              </>
            ) : (
              <p className="font-mono text-sm text-slate/40">&mdash;</p>
            )}
          </div>

          {/* Strain */}
          <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-navy/15">
            <p className="label-mono text-slate/60 mb-3">Strain</p>
            {latest.day_strain !== null ? (
              <>
                <p className="font-mono text-3xl md:text-4xl font-medium leading-none tabular-nums text-navy">
                  {latest.day_strain}
                </p>
                <p className="font-mono text-xs text-slate/50 mt-2.5">
                  {latest.day_avg_hr !== null && <>Avg HR: {latest.day_avg_hr}bpm</>}
                </p>
              </>
            ) : (
              <p className="font-mono text-sm text-slate/40">&mdash;</p>
            )}
          </div>

          {/* Last Workout */}
          <div className="p-5 md:p-6">
            <p className="label-mono text-slate/60 mb-3">Last Workout</p>
            {lastWorkout ? (
              <>
                <p className="font-mono text-lg font-medium leading-tight text-navy capitalize">
                  {lastWorkout.sport}
                </p>
                <p className="font-mono text-sm text-burnt mt-1 tabular-nums">
                  {lastWorkout.strain !== null && <>{lastWorkout.strain} strain</>}
                </p>
                <p className="font-mono text-xs text-slate/50 mt-1.5">
                  {lastWorkout.duration_min !== null && <>{lastWorkout.duration_min}min</>}
                  {lastWorkout.duration_min !== null && lastWorkout.calories_kcal !== null && (
                    <span className="mx-1.5">&middot;</span>
                  )}
                  {lastWorkout.calories_kcal !== null && <>{lastWorkout.calories_kcal} kcal</>}
                </p>
              </>
            ) : (
              <p className="font-mono text-sm text-slate/40">&mdash;</p>
            )}
          </div>
        </motion.div>

        {/* Sparklines */}
        {trends && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.25, ease }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6"
          >
            {trends.recovery && trends.recovery.length > 1 && (
              <div>
                <span className="label-mono text-slate/40 text-[0.6rem] mb-1 block">Recovery</span>
                <Sparkline data={trends.recovery.map((r) => r.score)} color="#44aa99" label="recovery" />
              </div>
            )}
            {trends.strain && trends.strain.length > 1 && (
              <div>
                <span className="label-mono text-slate/40 text-[0.6rem] mb-1 block">Strain</span>
                <Sparkline data={trends.strain.map((s) => s.strain)} color="#1a2744" label="strain" />
              </div>
            )}
            {trends.sleep && trends.sleep.length > 1 && (
              <div>
                <span className="label-mono text-slate/40 text-[0.6rem] mb-1 block">Sleep</span>
                <Sparkline data={trends.sleep.map((s) => s.hours)} color="#d4702a" label="sleep" />
              </div>
            )}
          </motion.div>
        )}

        {/* Timestamp */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.3, ease }}
          className="font-mono text-[0.65rem] text-slate/35 mt-5 tracking-wide"
        >
          Updated {timeAgo(whoopData.updated_at)}
        </motion.p>

        <div className="rule-fade mt-20 md:mt-28" />
      </div>
    </section>
  );
}
