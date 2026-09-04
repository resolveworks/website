---
title: "Reasoning matters"
intro: "Reasoning traces are valuable. They can tell you a lot about your prompt. Unless your provider has decided you may not look."
date: "2026-09-03T13:55:28+00:00"
dateModified: "2026-09-03T13:55:28+00:00"
---

Maybe like you, I prompt a lot. I think by now, everyone does. But does the model know what we mean? Prompts are almost always ambiguous. A modern model deals with that by weighing the possibilities for a while before answering: it tries one reading, catches itself, tries the other, until it's out of reasoning budget. The answer that follows is just where that reasoning happened to stop.

You have probably seen a lot of answers, but maybe never a reasoning trace. Instead the model was "Cogitating..." or maybe even "Flibbertigibbeting...". There is a problem with this, though: an answer alone does not teach you much about your prompt.

The reasoning is different. "Inference" — drawing a conclusion from premises, step by step — is what can be learned from. I learned prompting, and how to reason _with_ these models, from these reasoning traces — watching where my words landed, watching a first thought march off in a direction I never intended.

It's also what the labs themselves use: smaller models are trained on the thinking of the bigger ones. It's where a remarkable share of the field's progress comes from. The thinking trace holds the teachable part — reasoning can move from one mind to another, model or human. We are, in a sense, models too. The same artifact trains all of us.

So, if the reasoning trace is so important, why is it hidden? I think it depends on what we want our inference providers to be.

## Oracle or teacher

In my mind, there are roughly two possibilities. The **oracle**: you ask, it answers, and you come back tomorrow exactly as ignorant as you were today. Or the **teacher**: one whose reasoning you can watch and learn from.

In the products most people use, the thinking has been taken away. You now wait for some sort of spinner, and then an answer appears. What happened in between is [summarized by a different model](https://platform.claude.com/docs/en/build-with-claude/thinking), or simply withheld. However, the reasoning still gets generated, billed to you as output, and handed to your application as an [encrypted blob](https://developers.openai.com/api/docs/guides/reasoning). One that you must store, pass back on every turn, and can never open.

So the tokens exist, I pay for them and my infrastructure carries them. But I'm not allowed to read them? The arguments providers give for this, on closer inspection, support publishing just as well.

## The raw reality

The thinking traces are the rough scratchpad of the model — meandering, raw, unpolished. Sometimes they don't even contain the real reason the model answered as it did. The providers argue that's why they can't publish these. They want the model to be free to output anything in the thinking trace; teaching it to self-censor could lead to it hiding undesired behavior.

This uncensored output is used to understand why a model behaved the way it did, to [catch deception and reward hacking](https://openai.com/index/chain-of-thought-monitoring/). This, however, is just as important to me, the user. When one of my agents makes a call that I have to defend, I'm the one on the line. I need that provenance too. Instead I'm left holding an encrypted blob, hoping the one who sealed it is still around to open it.

Another argument flowing from the lack of censoring is that the traces can contain secrets. But that points at a different problem. Secrets should not end up in the model's context at all — I shouldn't be sending these in the first place. Hiding the trace does nothing about that — it actually makes it harder to catch these kinds of leaks.

In reality, hiding the thinking tokens is a desperate attempt at keeping them out of the training data of the competition.

## Open science

Let's talk about that competition, because there is a different approach: labs that do their [science in the open](https://qwen.ai/research/), that [publish their research](https://deepseek.com/en/news/) and [their models](https://www.zhipuai.cn/en/research), freely, for [anyone to learn from](https://www.kimi.ai/blog/). Want the reasoning tokens? Anyone can run their models and generate some, which means there is no incentive to hide the thinking traces.

You can even run these yourself. But you don't have to — there are [many parties out there](https://openrouter.ai/) that run these models for you. Being able to choose between many different providers leads to competition and better prices, [also from the closed labs](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/).

Availability and low prices are a nice side effect, but not the main reason to choose open models. The reason is in what you get back: not just an answer, but the thinking that produced it. Read a few traces and you'll see what I mean. It's the best education this technology has to offer.

## Choose the teacher

So next time, before you subscribe to one of the oracles, ask yourself what you want to gain from this relationship. There is a version of this technology that shows you everything and makes you better at working with it. A version that does not make you dependent on a single provider. A whole ecosystem of competition with the option to run things yourself.

The person who watches reasoning learns to steer. The person who watches spinners learns to wait.

I'm thankful that I'm very bad at waiting.
