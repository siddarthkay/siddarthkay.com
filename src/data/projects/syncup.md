![SyncUp icon](/projects/syncup/icon.png)

**Sync your files across every device you own. Peer to peer, end to end encrypted, no cloud in the middle.** [SyncUp](https://github.com/siddarthkay/syncthing-app) is an open-source Syncthing client for iPhone and Android, built from one React Native codebase. The Syncthing daemon runs inside the app, so your files move straight from phone to laptop to server without stopping at anyone else's datacenter.

## The gap it fills

Syncthing's official Android client was archived in December 2024. iOS has never had a great story. No single client has ever run on both phones from the same codebase. That is the gap SyncUp closes.

If you already use Syncthing on a desktop or home server, SyncUp plugs your phone into that same mesh. If you do not, SyncUp plus any second device is enough to keep your photos, notes, and working files in one place without handing them to a cloud provider.

## What it looks like

```screenshots
Status | /projects/syncup/status.png
Folders | /projects/syncup/folders.png
Devices | /projects/syncup/devices.png
Settings | /projects/syncup/settings.png
```

One folder, three devices, live status.

![iOS, Android, and desktop Syncthing nodes sharing one folder](/projects/syncup/cross-platform-sync.png)

## Built for phones, not ported to them

**Pair in seconds with a QR code.** Display yours, scan theirs. The 56-character device ID never has to be typed by hand.

**Auto-accept folders from trusted peers.** Flip a switch when you add someone, and every folder they share arrives on your device without a prompt. Everyone else lands as an accept-or-ignore card in the Folders tab.

**Live updates, not a polling loop.** The UI subscribes to the daemon's event stream, so new files, config changes, and incoming offers reach the screen in about a second.

**No background service to babysit.** The daemon runs in-process via [gomobile](https://pkg.go.dev/golang.org/x/mobile). There is no subprocess, no IPC, and nothing for Android to kill and restart behind your back.

## How it is built

A React Native UI in TypeScript, a TurboModule in Swift and Kotlin for daemon lifecycle and sandboxed filesystem access, and the upstream Syncthing daemon embedded as a Go library through `gomobile`. Everything above lifecycle calls goes through the Syncthing REST API at `127.0.0.1:8384`, the same API the desktop client uses. One source of truth, two platforms.

Scaffolded on [react-native-go](https://github.com/siddarthkay/react-native-go), a template I built for wiring Go into React Native cleanly so this project did not have to start from zero.

## The honest part about iOS

Apple does not allow continuous background execution outside a few categories (VoIP, audio, location) and a sync client does not qualify. SyncUp registers two `BGTaskScheduler` jobs and, in practice, gets roughly one to two hours of opportunistic sync per day. Sometimes with multi-hour gaps between runs.

I am not going to pretend otherwise. If you need a node that is genuinely always online, run Syncthing on a desktop or home server too. Your phone stays opportunistic on its own, but it reconciles against a complete copy whenever it wakes up, instead of depending on other phones being awake at the same moment.

Android has no such cap. The daemon runs as long as the OS allows, with wifi-only and charging-only toggles in Settings.

## Status

The codebase is at v0. The first real milestone, an iOS simulator, an Android emulator, and a desktop Syncthing node all sharing one folder, is done. TestFlight and Play Store releases are next. Full build, release, and contribution docs live in the [repo](https://github.com/siddarthkay/syncthing-app).

If this is the kind of thing you want on your phone, a GitHub star is the signal I watch to decide what to keep building.

- [Star on GitHub](https://github.com/siddarthkay/syncthing-app)
- [Sponsor on GitHub](https://github.com/sponsors/siddarthkay)

Licensed MPL-2.0.
