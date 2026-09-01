<script>
  import business from '$lib/data/business.json';
  import author from '$lib/data/author.json';
  import { SITE_NAME, SITE_URL, SITE_DESCRIPTIONS, pageTitle, mailtoHref } from '$lib/site.js';
  import Seo from '$lib/components/Seo.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Features from '$lib/components/Features.svelte';
  import DefinitionList from '$lib/components/DefinitionList.svelte';
  import Roadmap from '$lib/components/Roadmap.svelte';
  import Visualization from '$lib/components/Visualization.svelte';
  import About from '$lib/components/About.svelte';
  import JsonLd from '$lib/components/JsonLd.svelte';
  import faqQuestions from '$lib/data/faq.json';
  import talks from '$lib/data/talks.json';
  import { formatDate } from '$lib/site.js';

  let { data } = $props();

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqQuestions.map(({ question, paragraphs }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: paragraphs.join('\n\n')
      }
    }))
  };

  const professionalService = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: SITE_NAME,
    description:
      'Software and data engineering for organizations doing public-interest work: LLM-assisted data pipelines with human verification, entity resolution, search infrastructure, and full product development.',
    url: `${SITE_URL}/`,
    '@id': `${SITE_URL}/#organization`,
    telephone: business.phone.href,
    email: business.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'Estonia'
    },
    priceRange: '€€€',
    openingHours: 'Mo-Fr 09:00-18:00',
    founder: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: author.name,
      jobTitle: author.jobTitle,
      url: business.linkedin,
      sameAs: [business.linkedin, business.github]
    },
    sameAs: [business.linkedin, business.github],
    knowsAbout: [
      'AI',
      'Machine Learning',
      'LLM',
      'Entity Resolution',
      'Data Engineering',
      'Software Engineering',
      'Open Data'
    ]
  };
</script>

<Seo
  title={pageTitle('Software & data engineering for work that matters')}
  description={SITE_DESCRIPTIONS.home}
  socialTitle="Software & data engineering for work that matters"
  ogImage={`${SITE_URL}/og/home.png`}
/>

<div class="home-page">
  <div class="visualization-container">
    <Visualization embeddingsKey="home" />
  </div>

  <main>
    <Hero
      title="Most IT work is pointless."
      tagline="I take on the part that isn't: hard software and data problems for organizations doing work that matters."
    >
      <a href={mailtoHref(business.contact.subject, business.contact.body)}>
        <span aria-hidden="true">→</span>
        Contact me
      </a>
      <a href="#work" class="secondary">
        <span aria-hidden="true">↓</span>
        See my work
      </a>
    </Hero>

    <section class="section section-light">
      <h2>Something resembling a plan.</h2>
      <p>
        Every engagement starts with the best plan we can make — and the near-certainty that real data will punch holes in
        it. What stays fixed is how I work: in the open, in small pieces, with you close enough to steer.
      </p>
      <Features columns={3}>
        <li>
          <h3>Show, don't tell.</h3>
          <p>You judge <b>working software</b> running against your data, early enough that changing course is still cheap.</p>
        </li>
        <li>
          <h3>Dead ends included.</h3>
          <p>
            I write down <b>what didn't work</b> and why. Read the <a
              href="https://discuss.opensanctions.org/t/poliloom-loom-for-weaving-politicians-data/121">PoliLoom devlog</a> to see what that looks like.
          </p>
        </li>
        <li>
          <h3>You keep the keys.</h3>
          <p><b>Code, documentation, and a team</b> that understands what's running. Built to hand over, not to be needed.</p>
        </li>
      </Features>
    </section>

    <section class="section section-dark">
      <h2>What I do</h2>
      <p>Fifteen years of production work keeps circling back to the same set of capabilities:</p>
      <Features columns={2}>
        <li>
          <h3>AI agents &amp; search</h3>
          <p>
            Structured facts from unstructured documents, and agents that do the research. Underneath both is hybrid
            search, reconciling records across sources and languages over millions of entities.
          </p>
        </li>
        <li>
          <h3>Interfaces for working with data</h3>
          <p>
            Review screens, research tools, search frontends: interfaces where people judge, correct and explore. Built
            for people whose work depends on the data being right.
          </p>
        </li>
        <li>
          <h3>The full stack</h3>
          <p>
            Database, pipelines, API, the interface people work with, and the servers it runs on—auth, backups, deploys and
            monitoring included.
          </p>
        </li>
        <li>
          <h3>Stay up to date</h3>
          <p>
            I continuously experiment. The field changes, so I change with it. Curiosity drives me to explore how new technology can move us forward.
          </p>
        </li>
      </Features>
    </section>

    <section class="section section-light">
      <h2>From roadmap to rollout</h2>
      <Roadmap>
        <li>
          <h3>Find the hard part</h3>
          <p>Every project has one. We go there first, with real data.</p>
        </li>
        <li>
          <h3>Try the smallest useful thing</h3>
          <p>A prototype that does something real, within weeks.</p>
        </li>
        <li>
          <h3>Learn where it breaks</h3>
          <p>Real users, real edge cases. What did we miss?</p>
        </li>
        <li>
          <h3>Make it boring</h3>
          <p>Tested, monitored, documented: software you can run without me.</p>
        </li>
      </Roadmap>
    </section>

    <section id="work" class="section section-light">
      <h2>Current work</h2>
      <DefinitionList>
        <dt>Project</dt>
        <dd>
          <a href="https://loom.everypolitician.org">PoliLoom</a>, part of <a href="https://everypolitician.org/"
            >EveryPolitician</a
          >: structuring politicians' data for investigators and the accountability sector.
        </dd>
        <dt>Client</dt>
        <dd><a href="https://www.opensanctions.org/">OpenSanctions</a></dd>
        <dt>Role</dt>
        <dd>Project lead, EveryPolitician (2025–present)</dd>
      </DefinitionList>
      <Features columns={3}>
        <li>
          <h3>The problem</h3>
          <p>
            Assemble and verify structured politician data from Wikipedia/Wikidata and the wider web, across languages,
            ensuring provenance, correctness, and scale.
          </p>
        </li>
        <li>
          <h3>Solution highlights</h3>
          <p>
            <b>Two-stage extraction pipeline</b>: LLM extracts free-text positions → hybrid search maps to existing entities
            → LLM reconciles.
          </p>
          <p>
            <b>Fast hybrid search</b>: Meilisearch with OpenAI embeddings for combined semantic and lexical entity matching
          </p>
          <p>
            <b>Source verification</b>: web sources archived as MHTML via Playwright and reviewed through a FastAPI + Next.js
            confirmation UI
          </p>
        </li>
        <li>
          <h3>Impact</h3>
          <p>
            <b>Receipts</b>: Every extracted fact links to the exact sentence in the archived source page, highlighted
            for the evaluator.
          </p>
          <p><b>Upstream</b>: Confirmed statements are pushed to Wikidata on the evaluator's behalf.</p>
          <p><b>It learns</b>: Rejected statements feed back into improving the extraction.</p>
        </li>
      </Features>
      <p>
        LLM entity reconciliation actually works well, and with human-in-the-loop verification, it's both accurate and accountable. <a
          href="https://discuss.opensanctions.org/t/poliloom-loom-for-weaving-politicians-data/121">Read the devlog</a
        >, or the <a href="https://blog.wikimedia.de/2026/07/08/everypolitician-mit-wikidata/">Wikimedia Deutschland interview</a> about the project. The <a
          href="https://discuss.opensanctions.org/t/kolkhoz-pravda/322">Kolkhoz &amp; Pravda projects</a
        > ask the next question: can the same ideas work on any page — and how do you find the pages worth reading?
      </p>
    </section>

    <section class="section section-light">
      <h2>Writing &amp; speaking</h2>
      <p>I think in public — essays on this site, talks at conferences and meetups.</p>
      <div class="writing-speaking">
        <div>
          <h3>Latest articles</h3>
          <dl>
            {#each data.articles.slice(0, 5) as article (article.slug)}
              <dt><a href={`/articles/${article.slug}/`}>{article.title}</a></dt>
              <dd><time datetime={article.date}>{formatDate(article.date)}</time></dd>
            {/each}
          </dl>
          <p><a href="/articles/">All articles <span aria-hidden="true">→</span></a></p>
        </div>
        {#if talks.length}
          <div>
            <h3>Latest talks</h3>
            <dl>
              {#each talks.slice(0, 5) as talk (talk.url)}
                <dt>
                  <a href={talk.url} target="_blank" rel="noopener"
                    >{talk.title} <span aria-hidden="true">↗</span></a
                  >
                </dt>
                <dd>
                  {talk.event} ·
                  <time datetime={talk.date}>{formatDate(talk.date)}</time>
                </dd>
              {/each}
            </dl>
          </div>
        {/if}
      </div>
    </section>

    <section class="section section-light">
      <h2>About Johan</h2>
      <About />
    </section>

    <section class="section section-light">
      <h2>Frequently asked questions</h2>
      {#each faqQuestions as { question, paragraphs } (question)}
        <details>
          <summary>{question}</summary>
          {#each paragraphs as paragraph}
            <p>{paragraph}</p>
          {/each}
        </details>
      {/each}
    </section>
  </main>

  <JsonLd data={faqPage} />
  <JsonLd data={professionalService} />
</div>
