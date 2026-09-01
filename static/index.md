---
title: "Software & data engineering for work that matters - Resolve."
description: "Open software and data engineering: AI agents, interfaces for working with data, and full-stack product development for organizations with a mission."
---

# Most IT work is pointless.

I take on the part that isn't: hard software and data problems for organizations doing work that matters.

[Contact me](mailto:johan@resolve.works?subject=Up%20for%20a%20coffee%3F&body=Hi%2C%0A%0AWe're%20curious%20about%20how%20you%20could%20help%20us%20with%20our%20current%20challenge.%0A%0A...%0A%0ABest%20regards%2C%0A...) [See my work](https://resolve.works/#work)

## Something resembling a plan.

Every engagement starts with the best plan we can make — and the near-certainty that real data will punch holes in it. What stays fixed is how I work: in the open, in small pieces, with you close enough to steer.

-   **Show, don't tell.**

    You judge **working software** running against your data, early enough that changing course is still cheap.

-   **Dead ends included.**

    I write down **what didn't work** and why. Read the [PoliLoom devlog](https://discuss.opensanctions.org/t/poliloom-loom-for-weaving-politicians-data/121) to see what that looks like.

-   **You keep the keys.**

    **Code, documentation, and a team** that understands what's running. Built to hand over, not to be needed.

## What I do

Fifteen years of production work keeps circling back to the same set of capabilities:

-   **AI agents & search**

    Structured facts from unstructured documents, and agents that do the research. Underneath both is hybrid search, reconciling records across sources and languages over millions of entities.

-   **Interfaces for working with data**

    Review screens, research tools, search frontends: interfaces where people judge, correct and explore. Built for people whose work depends on the data being right.

-   **The full stack**

    Database, pipelines, API, the interface people work with, and the servers it runs on—auth, backups, deploys and monitoring included.

-   **Stay up to date**

    I continuously experiment. The field changes, so I change with it. Curiosity drives me to explore how new technology can move us forward.

## From roadmap to rollout

1.  **Find the hard part**

    Every project has one. We go there first, with real data.

2.  **Try the smallest useful thing**

    A prototype that does something real, within weeks.

3.  **Learn where it breaks**

    Real users, real edge cases. What did we miss?

4.  **Make it boring**

    Tested, monitored, documented: software you can run without me.

## Current work

- **Project** — [PoliLoom](https://loom.everypolitician.org), part of [EveryPolitician](https://everypolitician.org/): structuring politicians' data for investigators and the accountability sector.
- **Client** — [OpenSanctions](https://www.opensanctions.org/)
- **Role** — Project lead, EveryPolitician (2025–present)

-   **The problem**

    Assemble and verify structured politician data from Wikipedia/Wikidata and the wider web, across languages, ensuring provenance, correctness, and scale.

-   **Solution highlights**

    **Two-stage extraction pipeline**: LLM extracts free-text positions → hybrid search maps to existing entities → LLM reconciles.

    **Fast hybrid search**: Meilisearch with OpenAI embeddings for combined semantic and lexical entity matching

    **Source verification**: web sources archived as MHTML via Playwright and reviewed through a FastAPI + Next.js confirmation UI

-   **Impact**

    **Receipts**: Every extracted fact links to the exact sentence in the archived source page, highlighted for the evaluator.

    **Upstream**: Confirmed statements are pushed to Wikidata on the evaluator's behalf.

    **It learns**: Rejected statements feed back into improving the extraction.

LLM entity reconciliation actually works well, and with human-in-the-loop verification, it's both accurate and accountable. [Read the devlog](https://discuss.opensanctions.org/t/poliloom-loom-for-weaving-politicians-data/121), or the [Wikimedia Deutschland interview](https://blog.wikimedia.de/2026/07/08/everypolitician-mit-wikidata/) about the project. The [Kolkhoz & Pravda projects](https://discuss.opensanctions.org/t/kolkhoz-pravda/322) ask the next question: can the same ideas work on any page — and how do you find the pages worth reading?

## Writing & speaking

I think in public — essays on this site, talks at conferences and meetups.

### Latest articles

- **[Everything in its place](https://resolve.works/articles/everything-in-its-place/)** — August 26, 2026
- **[Pi is a really nice agent](https://resolve.works/articles/pi-is-a-really-nice-agent/)** — July 30, 2026
- **[The tool is not the author](https://resolve.works/articles/the-tool-is-not-the-author/)** — April 10, 2026
- **[AI agents are human too](https://resolve.works/articles/ai-agents-are-human-too/)** — December 6, 2025

[All articles](https://resolve.works/articles/)

### Latest talks

- **[Who is running the world?](https://opensanctions.github.io/wikimania2026/)** — Wikimania 2026, Paris — with Ada Homolova · July 21, 2026
- **[Text embeddings: navigating text in high dimensions](https://resolveworks.github.io/dataharvest2026/)** — Dataharvest 2026 — with Ada Homolova · May 31, 2026
- **[PoliLoom: Verification-First AI for Political Data in Wikidata](https://opensanctions.github.io/wikidatacon2025/)** — WikiDataCon 2025 — with Brenna Maeve · November 2, 2025
- **[Finding connections](https://resolveworks.github.io/nodes2025/)** — Road to NODES 2025 (Neo4j) · September 1, 2025
- **[Finding connections: transform your document collections into a graph visualisation](https://resolveworks.github.io/dataharvest2025/)** — Dataharvest 2025 — with Lasse Edfast · May 23, 2025

## About Johan

I am an autodidact software and data engineer with fifteen-plus years of experience, most of it for organizations doing public-interest work.

I work remotely, Europe-focused but global clients welcome.

![Profile shot of Johan Schuijt](https://resolve.works/avatar.webp)

### Selected experience

- **OpenSanctions** — Project lead, EveryPolitician (2025–present)
- **Follow the Money** — Full Stack Developer (2021–2025)
- **Forest.host** — Founder (2017–2021)

### Let's get in touch

- **LinkedIn** — [https://www.linkedin.com/in/johanschuijt/](https://www.linkedin.com/in/johanschuijt/)
- **GitHub** — [https://github.com/monneyboi/](https://github.com/monneyboi/)
- **Email** — [johan@resolve.works](mailto:johan@resolve.works?subject=Up%20for%20a%20coffee%3F&body=Hi%20Johan%2C%0D%0A%0D%0AWe're%20curious%20about%20how%20you%20could%20help%20us%20with%20our%20current%20challenge.%0D%0A%0D%0A...%0D%0A%0D%0ABest%20regards%2C%0D%0A...)
- **Phone** — [+31 651 952 461](tel:+31651952461)

## Frequently asked questions

**What kinds of problems are you best at solving?**

Data problems where information is scattered, unstructured, or trapped in formats that don't talk to each other. Think: extracting structured facts from thousands of documents, connecting data across systems, or building pipelines that turn messy inputs into something reliable and searchable.

I strive for simple solutions. If your problem is better solved with a spreadsheet or a well-written SQL query, I'll tell you that.

**How involved does our team need to be?**

More at the start, less over time. Early on I need access to the people who understand the problem—what's painful, what the data looks like, what "good enough" means. That might be a few hours in the first week or two.

During prototyping I'll share work frequently and need feedback. Once we're building for real, involvement drops to occasional check-ins and testing. By handover, the goal is that your team understands what's running and can operate it without me.

**What does a typical project timeline look like?**

It depends entirely on the problem. A small integration might take a few weeks; a complex data pipeline with verification workflows takes months and evolves as we learn what works.

What I can promise: I ship early and often. You'll see working pieces within the first few weeks, not a big reveal after months of silence.

**Who owns the code?**

You do. Everything I build for you is yours—code, configurations, documentation. I prefer to build things that could be open-sourced if you wanted, and I'll actively suggest it when it makes sense. No vendor lock-in, no proprietary dependencies that tie you to me.

**Do you also build the user interface, or just the backend?**

Both. I design and build the full system—data pipelines, APIs, and interfaces. A clear UI isn't optional; it's what makes the difference between a tool that gets used and one that gets abandoned.

**What do you charge?**

People hire me when the problem matters and the result has to hold up—if the deciding factor is price, I'm probably not the right hire.

**What do you need from us to figure out if we're a good fit?**

A conversation about the problem, and why it matters. I work best with organizations doing something meaningful: journalism, accountability, public interest, open data, or businesses that genuinely care about doing good work rather than just scaling revenue.

If your goal is "add AI to make investors happy," we're probably not a match. If you're trying to solve a real problem and want to understand what you're building, let's talk.
