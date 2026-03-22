I've been running Ethereum validators for a little over two years now, split between Lido's distributed validator network and my own Rocket Pool minipool. 2025 was the first full calendar year where I had stable infrastructure and could actually reflect on what running validators at this level looks like over time.

## The setup

My consensus layer is Nimbus. I chose it early on because the team is small and focused, the memory footprint is low, and it's written in Nim, which I find easier to audit than Go or Rust. My execution layer is Nethermind, running on dedicated Hetzner bare metal in Finland. I run my own MEV-Boost relay selection, currently pointing at Flashbots and Agnostic.

The hardware is a single AX52 with 64 GB RAM and two NVMe SSDs in a software RAID. Overkill for a single validator, appropriately sized for a small operator running multiple.

## Uptime and incidents

Over 2025, I maintained 99.4% attestation effectiveness. The two meaningful downtime events were both self-inflicted:

**February:** I updated Nethermind without reading the changelog carefully. The new version introduced a breaking change in how the Engine API handled certain edge cases during Dencun-related blob processing. Consensus dropped to zero for about 40 minutes before I caught it in monitoring. Lesson: read the full release notes, not just the headline features.

**August:** A routine Hetzner maintenance window ran over. I had set up automatic restart but not automatic re-peering. Nimbus came back up but didn't reconnect to peers quickly enough, resulting in missed attestations for about two epochs. The fix was a small script that checks peer count after restart and alerts if it's below threshold after 10 minutes.

## Rocket Pool ODAO governance

Being a Rocket Pool ODAO member means participating in on-chain votes for protocol upgrades and oracle submissions. In 2025 that meant voting on the Saturn upgrade and several smaller parameter changes. The tooling has improved significantly but it still requires more manual attention than it should. I'd like to see better notifications for upcoming votes.

## What I'd do differently

Run two consensus clients in checkpoint sync mode, fail over automatically. The single-client setup is fine for attestations but adds operational stress during upgrades. A standby Teku or Lighthouse node that can take over within a few minutes would have prevented both incidents above.

I'd also invest earlier in proper monitoring. I started with basic Prometheus/Grafana but it took until mid-year to get alerting tuned correctly. Too many false positives early on means you start ignoring alerts, which is worse than no alerting at all.
