---
title: "Everything in its place"
intro: "After years of backups inside backups and secrets scattered across machines, my devices now form one synced, encrypted whole that basically maintains itself."
date: "2026-08-26T08:58:48.861087+00:00"
dateModified: "2026-08-26T08:58:48.861087+00:00"
---

For years my documents lived in my Documents folder. Making a backup meant copying files onto an external drive, archiving them, and then putting the archive into a backup folder on the new computer. It worked, but over time I ended up with backups inside backups inside backups. I no longer had any idea what was where. 

Passwords were a different story though, neatly managed in a password manager. And API keys lived in environment files, which is standard practice, but it left them scattered across whatever machine needed them.

I'd wanted proper backups and secret management for the longest time — I was just always working on something else. I tried to tackle it before. Years ago I ran [Syncthing](https://syncthing.net/) to sync files directly between my devices, and used [KeePass](https://keepass.info/) for managing secrets. It mostly worked. But back then this setup was rough around the edges and would break in unexpected ways. 

So at some point I switched to a commercial solution, which felt like progress. Until eventually it didn't anymore, and I wanted out.

So, last week, when I received a Pixel phone and reinstalled my desktop, I decided to finally give it another shot and was pleasantly surprised. Setting up secret management and backups these days is a breeze; it just works. And on top of that, Syncthing now has an [Android fork](https://github.com/researchxxl/syncthing-android), and KeePass has an [Android app](https://www.keepassdx.com/) too!

Language models helped, of course. Giving an agent access to the Android Debug Bridge makes setting all this up and debugging it so easy that there's no reason to pay someone else to do it for you.

## A place for everything

Now all my devices — phone, laptop, desktop — have the same files in the same place. My pictures, my documents, my music, all of it. It doesn't matter anymore which device I pick up. All of them are mirrors; they keep my data in sync. The Linux machines also back everything up to network storage and an off-site location with [Restic](https://restic.net/) — keeping daily, weekly, monthly, and yearly snapshots. All of it open source, all of it under my own control, fully encrypted and stored in locations I chose myself.

Once again, my passwords live in a KeePass database. It syncs the same way, and now my whole system reads all secrets from one database. Applications ask it for what they need instead of me copying secrets around. It has my passwords, and the one-time codes for two-factor authentication live there too. My SSH keys live inside it as well and are ready for use when I unlock the database. Even my [development container](https://github.com/resolveworks/ward), a disposable Linux box, pulls its tokens out of the vault every time it starts. Nothing secret is hardcoded anywhere.

## An empty phone

I want my phone to be secure, simple, and fast, but most of all, I want to control the software stack. To me, it's ridiculous that Samsung and Google decide what I can and cannot run. They have such a strong hold on this ecosystem that it's practically impossible to ditch Google Play Services. It is required by many apps, and open-source alternatives are not always available. Their grip is so strong that some apps don't work on non-stock Android installations, even with Google services installed.

And Google is [locking down this ecosystem even further](https://keepandroidopen.org/). Starting in 2027, they will block every Android app whose developer hasn't registered with Google, signed their contract, paid up, and handed over government ID. This was what pushed me over the edge, and why I bought a Pixel. So I could run [GrapheneOS](https://grapheneos.org/) and make my own decisions.

Me buying a Google phone to escape from Google's grasp. There's some beautiful irony in that. But maybe I should thank them, because in the end, their decision is what triggered me to bring more order to my digital life.

## One thing, not many

What I got out of all this is a setup that basically maintains itself. I add a folder, and it's synced and backed up. I add a secret, and it's everywhere it needs to be. It's an evolving thing that grows with me.

It's also nice that my devices stopped being many different things. There's one thing now, and the phone, the laptop, and the desktop are just different views of the same whole. The same files, the same passwords, the same state, wherever I look. And because of the automatic snapshots, I can always roll back to an earlier state.

Gone are the days of backups within backups. I should not have to think about any of this ever again.
