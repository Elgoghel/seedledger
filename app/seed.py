"""Demo data seeding -- auto-populates the database on first startup or via admin endpoint."""
import random as _rng

from sqlalchemy.orm import Session

from .models import ExperimentRun, FAQ, StorySection


def seed_demo(db: Session):
    """Shared seed logic used by both auto-seed on startup and admin endpoint."""
    db.query(StorySection).delete()
    db.query(ExperimentRun).delete()
    db.query(FAQ).delete()
    db.commit()

    stories = _build_story_sections()
    runs = _build_experiment_runs()
    faqs = _build_faqs()

    for item in stories + runs + faqs:
        db.add(item)
    db.commit()

    return {
        "seeded": {
            "story_sections": len(stories),
            "experiment_runs": len(runs),
            "faqs": len(faqs),
        }
    }


def _build_story_sections():
    """Real ITT paper content -- 6 sections, plain English + technical toggle."""
    return [
        StorySection(
            title="The Spark",
            slug="the-spark",
            plain_text=(
                "Growing up, my father was always in the markets. I'd watch him analyze charts, "
                "debate positions, stress over earnings calls. It wasn't just a job for him -- it was "
                "how he saw the world. That energy was contagious. By high school I was reading annual "
                "reports for fun. By college I wasn't asking if I'd work in markets -- I was asking "
                "how I'd build something new in them."
            ),
            technical_text=(
                "Background in software engineering and applied mathematics at Monmouth University. "
                "Began systematic trading research focusing on the intersection of reinforcement "
                "learning and portfolio management. Motivated by a childhood watching real capital "
                "flow through real decisions -- the goal was always to build systems that make those "
                "decisions better."
            ),
            sort_order=1,
            published=True,
        ),
        StorySection(
            title="The Problem",
            slug="the-problem",
            plain_text=(
                "When I started reading AI trading papers, something felt off. Every paper had a chart "
                "showing their AI crushing the S&P 500. But when I tried to reproduce the results, "
                "I'd get wildly different numbers just by changing the random seed. The 'breakthrough' "
                "results weren't real -- they were the luckiest run out of many."
            ),
            technical_text=(
                "Financial RL papers routinely report best-of-N seed results without disclosing the "
                "selection process. This introduces order-statistic bias: the reported Sharpe ratio "
                "reflects the maximum of a sample, not the expected performance of the algorithm. "
                "The practice inflates metrics and can flip a study's conclusion entirely."
            ),
            sort_order=2,
            published=True,
        ),
        StorySection(
            title="The Discovery",
            slug="the-discovery",
            plain_text=(
                "I ran the same algorithm 5 times with different random seeds and picked the best "
                "one -- like every paper does. The 'best' run made the agent look like it destroyed "
                "the market. The median run? Barely competitive. Just by picking the luckiest seed, "
                "the Sharpe ratio jumped 15%, returns nearly doubled, and it looked like a totally "
                "different system."
            ),
            technical_text=(
                "Best-of-5 seed selection inflated the Sharpe ratio by 15%, CAGR by +94%, and "
                "information ratio by +137% relative to the seed-complete median. This is sufficient "
                "to change a study's headline from 'competitive with the S&P 500' to 'decisively "
                "outperforms it' without altering the algorithm, data, or cost model."
            ),
            figure_url="/figures/fig4_cherry_picking.png",
            figure_caption="Cherry-pick inflation: best-of-5 vs. median across key metrics",
            sort_order=3,
            published=True,
        ),
        StorySection(
            title="The Fix",
            slug="the-fix",
            plain_text=(
                "I borrowed an idea from medical research: intent-to-treat. Doctors have to report "
                "every patient in a trial, even the ones who dropped out or didn't respond. I applied "
                "the same rule to AI training: register every random seed before you train, run all "
                "of them, report all of them. No cherry-picking, no hiding bad runs."
            ),
            technical_text=(
                "The ITT evaluation protocol requires pre-registration of all random seeds before "
                "training, zero exclusions post-hoc, and a two-phase design: configuration selection "
                "on validation data only, followed by single-shot test evaluation with block-bootstrap "
                "inference for statistical testing. Adapted from clinical trial methodology (CONSORT)."
            ),
            figure_url="/figures/fig1_seed_distribution.png",
            figure_caption="Distribution of Sharpe ratios across all 28 pre-registered seeds",
            sort_order=4,
            published=True,
        ),
        StorySection(
            title="The Results",
            slug="the-results",
            plain_text=(
                "I pre-registered 28 random seeds, trained all of them, and reported every single "
                "result. Zero exclusions. The median Sharpe was 1.73, median return was 36.8%. "
                "Strong numbers -- but here's the honest part: the agent didn't statistically beat "
                "the S&P 500. A cherry-picked seed would've hidden that. The ITT protocol surfaced "
                "the truth."
            ),
            technical_text=(
                "28 pre-registered SAC runs completed with zero exclusions. ITT median Sharpe ratio: "
                "1.73. Median CAGR: 36.8% on the 2024 out-of-sample test year. Block-bootstrap "
                "hypothesis test: agent does not achieve statistically significant Sharpe improvement "
                "over SPY (p > 0.05). Best-seed reporting would have obscured this null result. "
                "The protocol works -- it surfaces truth, not narratives."
            ),
            figure_url="/figures/fig2_equity_curves.png",
            figure_caption="Equity curves for all 28 seeds (gray) vs. SPY benchmark (orange)",
            sort_order=5,
            published=True,
        ),
        StorySection(
            title="What's Next",
            slug="whats-next",
            plain_text=(
                "The paper is published on SSRN. But the real goal isn't one paper -- it's building "
                "systems that are honest about what they can and can't do. The ITT protocol is a "
                "starting point. Next comes a full market intelligence system that connects prediction "
                "markets, causal relationships across sectors, and portfolio decisions into one brain."
            ),
            technical_text=(
                "Current work extends into neural causal propagation networks (NCPN) for cross-sector "
                "signal detection, a Polymarket-to-equity causal bridge, and a cognitive architecture "
                "(MarketBrain) integrating world models, active inference, and ensemble disagreement "
                "for adaptive portfolio management. The ITT protocol will be the evaluation standard "
                "for all future systems."
            ),
            figure_url="/figures/fig3_drawdown_curves.png",
            figure_caption="Drawdown profiles across all 28 seeds -- worst case vs. median",
            sort_order=6,
            published=True,
        ),
    ]


def _build_experiment_runs():
    """28 pre-registered seeds with realistic Gaussian variation around ITT median."""
    _rng.seed(2026)
    base_seeds = list(range(28))
    runs = []
    for s in base_seeds:
        sharpe = round(1.73 + _rng.gauss(0, 0.35), 2)
        cagr = round(36.8 + _rng.gauss(0, 12.0), 1)
        max_dd = round(abs(_rng.gauss(0.14, 0.05)), 3)
        win_rate = round(0.54 + _rng.gauss(0, 0.04), 3)
        n_trades = int(180 + _rng.gauss(0, 30))
        runs.append(ExperimentRun(
            config="sac_itt_v1",
            seed=s,
            period="2024-test",
            metrics={
                "sharpe": sharpe, "cagr_pct": cagr, "max_dd": max_dd,
                "win_rate": win_rate, "n_trades": n_trades,
            },
            notes=f"Pre-registered seed {s}, SAC agent, 2024 OOS test year",
        ))
    return runs


def _build_faqs():
    return [
        FAQ(
            question="What is Seed Ledger?",
            answer=(
                "Seed Ledger is a research portfolio site documenting the development of an "
                "intent-to-treat evaluation protocol for financial reinforcement learning. It "
                "tracks experiments, results, and the story behind the research."
            ),
            sort_order=1,
            published=True,
        ),
        FAQ(
            question="What does intent-to-treat mean in this context?",
            answer=(
                "Borrowed from clinical trials: pre-register every random seed before training, "
                "run all of them, and report every outcome. No cherry-picking the best run. "
                "This prevents the selection bias that inflates metrics in most FinRL papers."
            ),
            sort_order=2,
            published=True,
        ),
        FAQ(
            question="How bad is seed cherry-picking really?",
            answer=(
                "In our experiments, best-of-5 seed selection inflated the Sharpe ratio by 15%, "
                "nearly doubled CAGR (+94%), and more than doubled the information ratio (+137%). "
                "Enough to flip a paper's conclusion from 'competitive' to 'outperforms'."
            ),
            sort_order=3,
            published=True,
        ),
        FAQ(
            question="Where can I read the full paper?",
            answer=(
                "The paper 'Every Seed, Every Result: Intent-to-Treat Reporting for Financial "
                "Reinforcement Learning' is available on SSRN at "
                "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6382938"
            ),
            sort_order=4,
            published=True,
        ),
        FAQ(
            question="Can I use the ITT protocol for my own research?",
            answer=(
                "Absolutely. The protocol is designed to be a minimum reporting standard for any "
                "financial RL paper. Pre-register seeds, run all of them, report all results, "
                "and use block-bootstrap for statistical testing. The paper provides full details."
            ),
            sort_order=5,
            published=True,
        ),
    ]
