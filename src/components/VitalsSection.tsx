import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import whoopData from "@/data/whoop-data.json";
import { ease } from "@/lib/motion";

function getRecoveryColor(score: number): string {
  if (score >= 67) return "#44aa99";
  if (score >= 34) return "#d4702a";
  return "#c0392b";
}

function daysAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  return diff + " days ago";
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

interface SparklinePoint {
  value: number;
  date?: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatVal(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function Sparkline({ data, color, label, unit }: { data: SparklinePoint[]; color: string; label: string; unit?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const values = data.map((d) => d.value);
  if (values.length < 2) return null;

  const W = 160;
  const GRAPH_H = 36;
  const LABEL_H = 20;
  const H = GRAPH_H + LABEL_H;
  const PAD = 4;
  const gid = "g-" + label;

  const { line, area, pts } = buildSparklinePath(values, W, GRAPH_H, PAD);

  const activeIdx = hovered ?? values.length - 1;
  const activePoint = pts[activeIdx];
  const activeVal = values[activeIdx];
  const activeDate = data[activeIdx]?.date;

  return (
    <svg
      viewBox={"0 0 " + W + " " + H}
      className="block overflow-visible w-full cursor-crosshair"
      style={{ height: H }}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={"url(#" + gid + ")"} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Invisible hit areas for each point */}
      {pts.map((p, i) => {
        const hitW = W / (pts.length - 1);
        return (
          <rect
            key={i}
            x={p.x - hitW / 2}
            y={0}
            width={hitW}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHovered(i)}
          />
        );
      })}

      {/* Vertical indicator line on hover */}
      {hovered !== null && (
        <line
          x1={activePoint.x} y1={activePoint.y}
          x2={activePoint.x} y2={GRAPH_H + 2}
          stroke={color} strokeWidth={1} strokeDasharray="2 2" opacity={0.3}
        />
      )}

      {/* Active point indicator */}
      <circle cx={activePoint.x} cy={activePoint.y} r={hovered !== null ? 3.5 : 2.5} fill={color} />

      {/* Value + date below the graph */}
      <text
        x={activePoint.x}
        y={GRAPH_H + 11}
        fill={color}
        fontSize={9}
        fontFamily="'JetBrains Mono', monospace"
        fontWeight={500}
        textAnchor="middle"
      >
        {formatVal(activeVal)}{unit ?? ""}
      </text>
      {activeDate && (
        <text
          x={activePoint.x}
          y={GRAPH_H + 19}
          fill={color}
          fontSize={7}
          fontFamily="'JetBrains Mono', monospace"
          opacity={hovered !== null ? 0.6 : 0.4}
          textAnchor="middle"
        >
          {formatDate(activeDate)}
        </text>
      )}
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
                  {latest.resting_heart_rate !== null && (
                    <><span className="mx-1.5">&middot;</span>RHR: {latest.resting_heart_rate}bpm</>
                  )}
                </p>
                <p className="font-mono text-xs text-slate/50 mt-1 leading-relaxed">
                  {latest.spo2_percentage !== null && (
                    <>SpO2: {Math.round(latest.spo2_percentage)}%</>
                  )}
                  {latest.skin_temp_celsius !== null && (
                    <><span className="mx-1.5">&middot;</span>{latest.skin_temp_celsius.toFixed(1)}&#176;C</>
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
                    <>Perf: {latest.sleep_performance_percentage}%</>
                  )}
                  {latest.respiratory_rate !== null && (
                    <><span className="mx-1.5">&middot;</span>{latest.respiratory_rate} br/min</>
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
                  {lastWorkout.calories_kcal !== null && (
                    <><span className="mx-1.5">&middot;</span>{lastWorkout.calories_kcal} kcal</>
                  )}
                </p>
                {lastWorkout.date && (
                  <p className="font-mono text-[0.6rem] text-slate/35 mt-1.5">{daysAgo(lastWorkout.date)}</p>
                )}
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
                <Sparkline
                  data={trends.recovery.filter((r) => r.score !== null).map((r) => ({ value: r.score!, date: r.date }))}
                  color="#44aa99" label="recovery" unit="%"
                />
              </div>
            )}
            {trends.strain && trends.strain.length > 1 && (
              <div>
                <span className="label-mono text-slate/40 text-[0.6rem] mb-1 block">Strain</span>
                <Sparkline
                  data={trends.strain.filter((s) => s.strain !== null).map((s) => ({ value: s.strain!, date: s.date }))}
                  color="#1a2744" label="strain"
                />
              </div>
            )}
            {trends.sleep && trends.sleep.length > 1 && (
              <div>
                <span className="label-mono text-slate/40 text-[0.6rem] mb-1 block">Sleep</span>
                <Sparkline
                  data={trends.sleep.filter((s) => s.hours !== null).map((s) => ({ value: s.hours!, date: s.date }))}
                  color="#d4702a" label="sleep" unit="h"
                />
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
