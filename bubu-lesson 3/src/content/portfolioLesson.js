/**
 * portfolioLesson.js — all lesson copy and activity definitions as data.
 *
 * Content lives here so a curriculum person can edit wording, swap numbers, or
 * add an activity without touching a component.
 *
 * SOURCE. The framing, the worked examples and most of the practical detail in
 * sections 2, 3, 5 and 6 come from Kara Ross, *Personal Finance for Teens and
 * College Students* (Publishing Forte, 2021) — needs that quietly turn into
 * wants, the bank fees that actually drain a student account, the credit-card
 * statement vocabulary, the closed-card utilization trap, and snowball vs
 * avalanche. Ideas are paraphrased and attributed, never lifted. Rates are
 * current figures from primary sources, not the book's 2021 numbers.
 *
 * Block kinds the renderer understands:
 *   prose     { html }
 *   callout   { tone: 'note'|'warn'|'bos', title, html }
 *   figures   { items: [{ value, label, note }] }
 *   layers | accountCards | horizons | ficoWeights | scoreBands
 *   activity blocks, keyed by `kind`:
 *     sort · order · match · mcq · numeric · explorer · sandbox · allocate
 */

import { REFERENCE_RATES as R, BANK_FEES, usd, pct } from '../lib/financeEngine.js';

export const lessonMeta = {
  id: 'college-financial-portfolio',
  tier: 'College',
  unit: 'Money in Motion',
  title: 'Building Your Financial Portfolio',
  subtitle:
    'Everything you own, everything you owe, and what to do about it first — worked out against a live bank sandbox.',
  minutes: 50,
  prerequisites: ['Budgeting with a real paycheck', 'Credit cards and credit scores'],
  objectives: [
    'Work out your own net worth from your accounts and loans.',
    'Tell a need from a want, including the needs that have quietly turned into wants.',
    'Put the five jobs your money has in order, and say why the order is what it is.',
    'Pick the right account for a goal based on when you need the money.',
    'Spot the bank fees that cost students the most, and know the move that prevents each one.',
    'Work out credit utilization, and what paying only the minimum really costs.',
    'Work out a student loan payment, and compare two ways of paying debt down.',
    'Build a monthly plan across all five layers and defend it.',
  ],
  source: {
    title: 'Personal Finance for Teens and College Students',
    author: 'Kara Ross',
    publisher: 'Publishing Forte, 2021',
  },
  disclaimer:
    'This lesson shows you how the math works so you can judge advice you get from other people. It is not advice itself, and it does not know anything about your situation. For decisions that matter, talk to someone who does. Your financial aid office is free, and it is a good place to start.',
};

export const sections = [
  // =========================================================================
  {
    id: 'what-a-portfolio-is',
    number: 1,
    title: 'What a portfolio actually is',
    objective: 'Work out your own net worth.',
    blocks: [
      {
        kind: 'prose',
        html: `<p>When people say “portfolio” they usually mean stocks. In personal finance it means something broader, and a lot more useful: everything you own, plus everything you owe.</p>
        <p>You already have one. You got a portfolio the day you opened a checking account, and it got more complicated the day you signed for a loan. Nobody hands you a statement that says so, which is most of the problem.</p>`,
      },
      {
        kind: 'prose',
        html: `<p>Two columns and one number:</p>
        <p class="formula"><strong>Net worth</strong> = what you own <span class="op">−</span> what you owe</p>
        <p>The left column is money you could actually get your hands on. Your checking balance. Savings. The security deposit your landlord is sitting on, which you get back if you leave the place in one piece. The $80 your roommate said he'd pay you back on Friday.</p>
        <p>The right column is money someone else can ask you for. What's on your credit card. Your student loans, even though repayment hasn't started. The dentist bill you've been ignoring.</p>`,
      },
      {
        kind: 'callout',
        tone: 'bos',
        title: 'Dr. Bos on the number you are about to get',
        html: `<p>The first time students work this out, most of them get a negative number and assume they've made a mistake somewhere. They usually haven't. If you borrowed for tuition, you're <em>supposed</em> to owe more than you own right now. That's what borrowing for school looks like written down.</p>
        <p>What I'd rather you notice is the difference between two kinds of negative. Money you borrowed for tuition bought you something that never shows up in the left column at all — the degree, and whatever you'll earn with it. Money you borrowed on a card bought things you've already used. Both make the number negative. Only one of them bought you anything that's still there.</p>`,
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'sort',
        id: 'pa-1-1',
        prompt: 'Sort each one. Two of these don\'t belong in either column — see if you can spot them.',
        buckets: [
          { key: 'asset', label: 'Own', hint: 'Money you could get your hands on' },
          { key: 'liability', label: 'Owe', hint: 'Money someone can ask you for' },
          { key: 'neither', label: 'Neither', hint: 'Not a balance at all' },
        ],
        items: [
          { id: 'i1', label: '$640 in checking', answer: 'asset', why: 'Money you can spend today.' },
          { id: 'i2', label: '$1,500 in savings', answer: 'asset', why: 'Same money, different job. Still yours.' },
          { id: 'i3', label: '$210 on your credit card', answer: 'liability', why: 'The card company paid for those things and wants the money back.' },
          { id: 'i4', label: '$5,500 student loan', answer: 'liability', why: 'You owe it whether or not payments have started.' },
          { id: 'i5', label: '$1,200 security deposit your landlord holds', answer: 'asset', why: 'It\'s your money sitting somewhere else. You get it back if you don\'t wreck the place.' },
          { id: 'i6', label: '$80 your roommate owes you', answer: 'asset', why: 'Worth exactly as much as your roommate is reliable, but it goes on the left.' },
          { id: 'i7', label: 'Last night\'s $60 concert ticket', answer: 'neither', why: 'You already used it. That was spending, and spending never becomes a balance.' },
          { id: 'i8', label: 'Your $16-a-month streaming subscription', answer: 'neither', why: 'It shows up in your budget every month, but it never shows up here. Your budget tracks money moving. Your portfolio tracks money sitting.' },
        ],
        closing:
          'Those last two are the part people get wrong. Your budget is a record of money moving. Your portfolio is a snapshot of money sitting still.',
      },
      {
        kind: 'activity',
        tier: 'challenge',
        kind: 'numeric',
        id: 'ca-1-2',
        prompt:
          'Take every item above that belongs in a column. What\'s this student\'s net worth? Put the minus sign in if it needs one.',
        answer: -2290,
        tolerance: 0,
        prefix: '$',
        hint: 'Own: 640 + 1,500 + 1,200 + 80. Owe: 210 + 5,500.',
        distractors: [
          { value: 3420, feedback: 'That\'s just the left column. Net worth subtracts what you owe.' },
          { value: 2290, feedback: 'Right number, wrong sign. This student owes more than they own, so the answer is negative.' },
          { value: 9130, feedback: 'You added the second column instead of subtracting it.' },
          { value: 5710, feedback: 'That\'s just the right column.' },
        ],
        solution:
          '$3,420 owned minus $5,710 owed is <strong>−$2,290</strong>. Negative, and completely ordinary for a sophomore with a loan.',
      },
    ],
  },

  // =========================================================================
  {
    id: 'five-layers',
    number: 2,
    title: 'What your money is for',
    objective: 'Tell needs from wants, and put the five jobs in order.',
    blocks: [
      {
        kind: 'prose',
        html: `<p>Before you can decide where money goes, you have to be honest about what it's going to. Kara Ross makes a point in <em>Personal Finance for Teens and College Students</em> that's easy to agree with and hard to actually apply: needs quietly turn into wants while you're not looking.</p>
        <p>Water is a need. A $6 latte is a want wearing a need's clothes. Food is a need; eating out four nights a week isn't. Somewhere to live is a need; the building with the gym and the rooftop is a want you're paying rent on every month. None of these are crimes. They're just not what you think they are when you're deciding what to cut.</p>
        <p>Her test is three questions, asked before you buy rather than after: Does this add anything to my life? Why am I buying it? Do I already own something that does this? You'll talk yourself into plenty of things anyway. You'll also catch a few.</p>`,
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'sort',
        id: 'pa-2-1',
        prompt:
          'Ross sorts spending on two axes at once: is it a need or a want, and how urgent is it? Put each one where it goes for a student living off campus.',
        buckets: [
          { key: 'hi-need', label: 'Need, urgent', hint: 'Something breaks if this goes unpaid' },
          { key: 'lo-need', label: 'Need, can wait', hint: 'Real, but not this month' },
          { key: 'hi-want', label: 'Want, worth it', hint: 'Not required, and you\'d defend it' },
          { key: 'lo-want', label: 'Want, be honest', hint: 'First to go when money is tight' },
        ],
        items: [
          { id: 'n1', label: 'Rent', answer: 'hi-need', why: 'Miss it and the consequences arrive fast.' },
          { id: 'n2', label: 'The textbook your class actually uses', answer: 'hi-need', why: 'You can rent it or buy it used, but you can\'t skip it.' },
          { id: 'n3', label: 'Bus pass to get to work', answer: 'hi-need', why: 'It\'s the thing that protects your income.' },
          { id: 'n4', label: 'Winter coat, and it\'s October', answer: 'lo-need', why: 'A real need with a date attached. Plan for it, don\'t panic-buy it in December.' },
          { id: 'n5', label: 'Replacing shoes that still have a few months left', answer: 'lo-need', why: 'Genuine need, wrong month. Ross\'s advice is to wait for the sale rather than pay full price on impulse.' },
          { id: 'w1', label: 'Dinner out with friends, once a month', answer: 'hi-want', why: 'A budget that leaves no room for this is a budget you\'ll abandon by week three.' },
          { id: 'w2', label: 'Bottled water when the tap is fine', answer: 'lo-want', why: 'The clearest example of a need turning into a want. Same water, several hundred times the price.' },
          { id: 'w3', label: 'A second streaming subscription', answer: 'lo-want', why: 'Ask her third question: do you already own something that does this?' },
        ],
        closing:
          'The interesting boxes are the bottom two. “Want, worth it” is the one that keeps a budget survivable. “Want, be honest” is where the money you couldn\'t account for last month went.',
      },
      {
        kind: 'prose',
        html: `<p>Once you know what you're spending on, the money itself has five jobs, and the jobs have an order. The order isn't about being careful. It comes from asking what breaks if you skip a step.</p>`,
      },
      { kind: 'layers', html: '' },
      {
        kind: 'prose',
        html: `<p>Each layer protects the ones above it. Skip <strong>Safety</strong> and jump to <strong>Growth</strong>, and the first time your car needs $400 of work you either sell investments at whatever the market is paying that week, or you put it on a card at ${pct(R.averageCarriedCardAPR)}. Neither one ruins your life. Both were avoidable, and what caused them was the order, not the amount.</p>
        <p>The cushion is the layer people skip, because it's boring and it grows slowly. Ross suggests three to six months of expenses, built at $10 or $20 a week rather than in one heroic transfer. That's deliberately unambitious. A cushion you build slowly is one you'll actually finish.</p>
        <p>The one place reasonable people disagree is the line between <strong>Debt payoff</strong> and <strong>Growth</strong>. Paying down a loan at ${pct(R.federalUndergradLoanAPR)} earns you a guaranteed ${pct(R.federalUndergradLoanAPR)}, because that's interest you stop paying. Investing has a higher expected return — around ${pct(R.longRunStockMarketReal, 0)} a year after inflation, historically — and no guarantee whatsoever. Where you land depends on things this lesson doesn't know about you. What isn't up for debate is a credit card balance at ${pct(R.averageCarriedCardAPR)}, which beats anything you can reliably earn and so goes first.</p>`,
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'order',
        id: 'pa-2-2',
        prompt: 'Put the five layers in the order you fund them.',
        items: [
          { id: 'growth', label: 'Growth', sub: 'Money you won\'t touch for years' },
          { id: 'cashflow', label: 'Cash flow', sub: 'This month happens without drama' },
          { id: 'debt', label: 'Debt payoff', sub: 'Stop paying interest' },
          { id: 'safety', label: 'Safety', sub: 'One bad week doesn\'t become debt' },
          { id: 'credit', label: 'Credit', sub: 'Build a record at no cost' },
        ],
        answer: ['cashflow', 'safety', 'credit', 'debt', 'growth'],
        solution:
          'Cash flow, then Safety, then Credit, then Debt payoff, then Growth. Credit sits third because a card you pay off in full every month costs you nothing and starts a clock you can\'t start later.',
      },
      {
        kind: 'activity',
        tier: 'challenge',
        kind: 'mcq',
        id: 'ca-2-3',
        prompt: `Priya has $1,100 in checking, nothing in savings, $340 on a credit card at ${pct(R.averageCarriedCardAPR)}, and $18,000 in <em>subsidized</em> federal loans, which don't accrue interest while she's enrolled. A summer stipend just paid her $600. Where does it do the most good?`,
        options: [
          {
            id: 'a',
            label: 'All $600 at the student loans, since that\'s the biggest number.',
            correct: false,
            feedback:
              'Biggest isn\'t the same as most expensive. Those loans are subsidized, so they\'re costing her nothing at the moment. The $340 on the card is costing her about $6 every month she leaves it there.',
          },
          {
            id: 'b',
            label: 'Clear the $340 card, put the other $260 in savings.',
            correct: true,
            feedback: `Clearing a ${pct(R.averageCarriedCardAPR)} balance is a guaranteed ${pct(R.averageCarriedCardAPR)} return, which nothing else on this list can promise. And the $260 is the start of a cushion she doesn't have, which is the thing that stops the card balance coming straight back next month.`,
          },
          {
            id: 'c',
            label: 'All $600 into an index fund. She\'s 20, time is on her side.',
            correct: false,
            feedback: `Time genuinely is on her side, and this is still the wrong first move. With nothing saved and a balance on the card, the next unexpected $300 goes right back on the card at ${pct(R.averageCarriedCardAPR)}. An expected ${pct(R.longRunStockMarketReal, 0)} doesn't beat a guaranteed ${pct(R.averageCarriedCardAPR)} cost.`,
          },
          {
            id: 'd',
            label: 'Leave it in checking so she keeps her options open.',
            correct: false,
            feedback:
              'Safe, and the most popular answer. It\'s also how $600 turns into $0 over a semester without anyone deciding to spend it. Money with no assigned job gets spent by default.',
          },
        ],
      },
    ],
  },

  // =========================================================================
  {
    id: 'three-accounts',
    number: 3,
    title: 'Three accounts, and what the bank charges you',
    objective: 'Match accounts to jobs, and spot the fees.',
    blocks: [
      {
        kind: 'prose',
        html: `<p>Most students' portfolios start as three accounts. On a banking app they look nearly identical. They do completely different jobs.</p>`,
      },
      { kind: 'accountCards', html: '' },
      {
        kind: 'prose',
        html: `<p>Two acronyms the bank will use on you, and they aren't the same thing. <strong>APY</strong> is what you earn over a year <em>including</em> the effect of interest compounding on itself. <strong>APR</strong> is the plain annual rate with no compounding in it. Banks quote APY when they're paying you and APR when you're paying them, which tells you something about which number tends to look better.</p>
        <p>The savings gap is the easiest money in this lesson. The national average savings account pays ${pct(R.nationalAverageSavingsAPY, 2)}. Online savings accounts are around ${pct(R.highYieldSavingsAPY, 2)}. Same federal insurance, same instant access, same money.</p>`,
      },
      {
        kind: 'figures',
        items: [
          { value: usd(2012.84, { cents: true }), label: 'National average', note: `$2,000 after a year at ${pct(R.nationalAverageSavingsAPY, 2)}` },
          { value: usd(2085.64, { cents: true }), label: 'Online savings', note: `$2,000 after a year at ${pct(R.highYieldSavingsAPY, 2)}` },
          { value: usd(72.8, { cents: true }), label: 'Difference', note: 'For filling in one form, once' },
        ],
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'match',
        id: 'pa-3-1',
        prompt: 'Match each account to the job it\'s built for.',
        left: [
          { id: 'checking', label: 'Checking' },
          { id: 'savings', label: 'Savings' },
          { id: 'card', label: 'Credit card' },
        ],
        right: [
          { id: 'checking', label: 'Money passes through — pay comes in, bills go out, nothing stays long' },
          { id: 'savings', label: 'Money sits — it has to be worth the same amount when you need it' },
          { id: 'card', label: 'Money is recorded — proof you can borrow and pay it back, free if you clear it monthly' },
        ],
      },
      {
        kind: 'callout',
        tone: 'warn',
        title: 'A credit card isn\'t money',
        html: `<p>It's a short-term loan the bank has pre-approved. Your app shows two numbers and they aren't interchangeable.</p>
        <p>The <strong>statement balance</strong> is what you spent during the last billing cycle. Pay that in full by the due date and you're inside the grace period — usually 20 to 30 days — and the interest charged is zero.</p>
        <p>The <strong>current balance</strong> is the statement balance plus whatever you've spent since. You can pay it, but you don't have to.</p>
        <p>Carry even part of the statement balance and most issuers end the grace period. Interest starts on what's left <em>and</em> on everything you buy next, from the day you buy it.</p>`,
      },
      {
        kind: 'activity',
        tier: 'challenge',
        kind: 'mcq',
        id: 'ca-3-2',
        prompt:
          'Marcus\'s statement balance is $412. Since the statement closed he\'s spent another $95, so the app shows $507. He pays $412 by the due date. What interest is he charged?',
        options: [
          { id: 'a', label: 'Nothing.', correct: true, feedback: 'He paid the statement balance in full, so the grace period holds. The $95 lands on next month\'s statement and gets the same treatment if he does the same thing again.' },
          { id: 'b', label: 'Interest on the $95 he hasn\'t paid yet.', correct: false, feedback: 'Not yet. He spent that after the statement closed, so it belongs to next cycle — and since he paid this one in full, it gets a grace period too.' },
          { id: 'c', label: 'Interest on the whole $507.', correct: false, feedback: 'That\'s what happens if he pays <em>less</em> than $412. Paying the statement balance in full is exactly the line between this and nothing.' },
          { id: 'd', label: 'A late fee, because the current balance is unpaid.', correct: false, feedback: 'The required payment is the minimum. The interest-free payment is the statement balance. The current balance is never what\'s due.' },
        ],
      },
      {
        kind: 'prose',
        html: `<p>Now the part nobody reads. Ross devotes a chunk of her banking chapter to fees, and she's right to, because for a student account the fees are the whole story. The interest you earn on a college checking balance is a rounding error. The fees are not.</p>`,
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'match',
        id: 'pa-3-3',
        prompt: 'Every one of these is avoidable. Match each fee to the move that prevents it.',
        left: BANK_FEES.map((f) => ({
          id: f.key,
          label: `${f.label} (${usd(f.low, { cents: f.low % 1 !== 0 })}–${usd(f.high)})`,
        })),
        right: BANK_FEES.map((f) => ({ id: f.key, label: f.avoid })),
      },
      {
        kind: 'activity',
        tier: 'challenge',
        kind: 'numeric',
        id: 'ca-3-4',
        prompt:
          'One semester, four months. Dani pays a $12 monthly maintenance fee every month, uses an out-of-network ATM six times at $3 a visit, overdrafts once at $35, and gets charged $10 twice for going over her savings account\'s free transfer limit. What did the bank take from her?',
        answer: 121,
        tolerance: 0,
        prefix: '$',
        hint: 'Four maintenance fees, six ATM visits, one overdraft, two transfer fees.',
        distractors: [
          { value: 73, feedback: 'You left out the overdraft, or one of the other one-off charges. Add all four kinds.' },
          { value: 86, feedback: 'Close. Check the maintenance fee: it\'s charged every month, so that\'s four of them.' },
          { value: 109, feedback: 'You have most of it. The savings transfer fee hit twice, not once.' },
        ],
        solution:
          '$48 + $18 + $35 + $20 = <strong>$121</strong>. Over the same four months, her $415 savings balance earned <strong>$0.89</strong> in interest at the national average rate. She paid the bank roughly 136 times what it paid her, and every one of those charges had a move that would have stopped it.',
      },
      {
        kind: 'callout',
        tone: 'bos',
        title: 'Dr. Bos on the boring fix',
        html: `<p>I've watched students spend an afternoon researching which index fund to buy while a $12 maintenance fee has been leaving their account every month for two years. The fund might beat the market. The fee is a certainty.</p>
        <p>Start with the certain thing. Call your bank and ask what it takes to get the monthly fee waived. It's usually a minimum balance, a direct deposit, or being a student, and it often takes one phone call.</p>`,
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'sandbox',
        mode: 'open-accounts',
        id: 'pa-3-5',
        prompt: 'Open all three. These are real API calls to Capital One\'s Nessie sandbox.',
        body:
          'Everything after this point reads from the accounts you create here, and so does Bubu\'s world when you get there.',
      },
    ],
  },

  // =========================================================================
  {
    id: 'liquidity-vs-growth',
    number: 4,
    title: 'When you need it decides where it goes',
    objective: 'Pick an account based on time horizon.',
    blocks: [
      {
        kind: 'prose',
        html: `<p>Every dollar you set aside has a date on it: the day you'll need it. That date picks the account. Not how you feel about risk, not what the market did last week.</p>
        <p>The reason is that time changes what volatility means. The S&amp;P 500 has lost more than a third of its value inside a single year. Across rolling twenty-year stretches it has always ended up ahead so far. Nothing about the investment changed between those two sentences. The only thing that changed was how long the money was left alone. And “always so far” isn't a promise — anyone who tells you it is has something to sell you.</p>`,
      },
      { kind: 'horizons', html: '' },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'sort',
        id: 'pa-4-1',
        prompt: 'Each goal has a date. Put it where the date says.',
        buckets: [
          { key: 'short', label: 'Under a year', hint: 'Can\'t be allowed to lose value' },
          { key: 'medium', label: '1–5 years', hint: 'Mostly safe, a bit of yield' },
          { key: 'long', label: '5+ years', hint: 'You can ride out a bad year' },
        ],
        items: [
          { id: 'g1', label: 'Flight home for winter break, 3 months away', answer: 'short', why: 'You need an exact amount on a known date. A 10% dip means you don\'t go.' },
          { id: 'g2', label: 'Replacing your laptop next fall', answer: 'short', why: 'Under a year. Being sure beats earning a few dollars.' },
          { id: 'g3', label: 'Grad school applications, 2 years out', answer: 'medium', why: 'Long enough for a CD or high-yield savings. Not long enough to recover from a bad year.' },
          { id: 'g4', label: 'A car after graduation, 3 years out', answer: 'medium', why: 'Same reasoning. Three years isn\'t enough runway.' },
          { id: 'g5', label: 'House down payment, 8 years out', answer: 'long', why: 'Long enough to take some risk, though most people move it toward safety as the date gets close.' },
          { id: 'g6', label: 'Retirement, 45 years out', answer: 'long', why: 'The obvious case. Over forty-five years, compounding does nearly all the work.' },
        ],
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'explorer',
        explorer: 'growth',
        id: 'pa-4-2',
        prompt: 'Compounding, with the dials showing.',
        body:
          'Move <em>years</em> first. Watch where the gap opens between the money you put in and the money you end up with. That gap is the whole argument for starting early, and it\'s why it\'s worth doing something about at 19 rather than 29.',
      },
      {
        kind: 'activity',
        tier: 'challenge',
        kind: 'mcq',
        id: 'ca-4-3',
        prompt: `Both of these students earn ${pct(R.longRunStockMarketReal, 0)} a year. <strong>Ana</strong> puts in $100 a month from 22 to 32, then stops completely and never adds another dollar. That's $12,000. <strong>Ben</strong> puts in $100 a month from 32 to 62 — $36,000, three times as much. Who has more at 62?`,
        options: [
          { id: 'a', label: 'Ben, comfortably. He put in three times the money.', correct: false, feedback: 'Ben ends up with about $121,997. Ana ends up with about $140,484, on a third of the contributions.' },
          { id: 'b', label: 'Ana, by around $18,000.', correct: true, feedback: 'Ana: roughly $140,484 from $12,000 in. Ben: roughly $121,997 from $36,000 in. Her ten years of contributions got thirty extra years to compound, and that head start was worth more than $24,000 of his money.' },
          { id: 'c', label: 'They finish within a few thousand dollars of each other.', correct: false, feedback: 'The gap is around $18,500, and it runs the opposite way from most people\'s guess.' },
          { id: 'd', label: 'It depends what order the returns come in.', correct: false, feedback: 'Sequence of returns matters enormously once you\'re withdrawing. At the steady rate this question specifies, it doesn\'t change the answer.' },
        ],
        closing:
          'Set the explorer to $100 a month at 7% and slide the years from 10 to 40. What you contribute barely moves. What you end up with moves by a factor of fifteen.',
      },
    ],
  },

  // =========================================================================
  {
    id: 'credit',
    number: 5,
    title: 'Credit is a record, not a resource',
    objective: 'Work out utilization and the cost of minimum payments.',
    blocks: [
      {
        kind: 'prose',
        html: `<p>A credit score isn't a measure of how much money you have, and it isn't a measure of whether you're a responsible person. It's a prediction of one thing: whether you'll pay on time. It runs from 300 to 850, and three agencies keep it — Experian, TransUnion and Equifax. You can see your own reports free at annualcreditreport.com, and you should, because errors on them are common and they're yours to dispute.</p>
        <p>Five things go into the score, with these weights:</p>`,
      },
      { kind: 'ficoWeights', html: '' },
      { kind: 'scoreBands', html: '' },
      {
        kind: 'prose',
        html: `<p>Two of the five are yours to fix this month: pay on time, and keep your balances low relative to your limits. One of them you can only fix by starting — <strong>length of credit history</strong> never speeds up, no matter what else you do. That's the real argument for getting a card as a student, and it has nothing to do with the rewards.</p>
        <p><strong>Utilization</strong> is your balance divided by your limit, and it's usually measured on the day your statement closes rather than the day you pay. Under 10% is where it stops costing you. On a $500 limit that means about $50 is your quiet ceiling, which is why a small limit is harder to manage than a big one, not safer.</p>`,
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'explorer',
        explorer: 'utilization',
        id: 'pa-5-1',
        prompt: 'Utilization, live.',
        body: 'Try a $500 limit with a $200 balance — one textbook — and see which band that lands you in.',
      },
      {
        kind: 'activity',
        tier: 'challenge',
        kind: 'numeric',
        id: 'ca-5-2',
        prompt:
          'Ross describes a trap worth knowing. You owe $1,000 across two credit cards, each with a $2,500 limit, so you\'re using 20% of your available credit. You decide to tidy up and close the card you never use. Your debt hasn\'t changed. What\'s your utilization now, as a percentage?',
        answer: 40,
        tolerance: 0.5,
        suffix: '%',
        hint: 'Closing a card removes its limit from the total, but not the balance from your debt. $1,000 divided by what?',
        distractors: [
          { value: 20, feedback: 'That was the number before. Closing the account took $2,500 of available credit off the table.' },
          { value: 10, feedback: 'Utilization went up, not down. You removed limit, not debt.' },
          { value: 100, feedback: 'You\'d have to owe the full $2,500 for that. You owe $1,000.' },
        ],
        solution:
          '$1,000 ÷ $2,500 = <strong>40%</strong>, up from 20%, with no change in what you owe. This is why the standard advice is to leave old cards open even if you don\'t use them. They\'re doing two jobs in the background: holding up your available credit, and aging your credit history.',
      },
      {
        kind: 'prose',
        html: `<p>Now the expensive part. The minimum payment is designed to be payable, not to get you out of debt. It's usually around 2% of what you owe, or a flat floor of about $25, whichever is larger. That covers the interest and very little else.</p>
        <p>Worth knowing the rest of the vocabulary on that statement too, because every item on the list costs real money: the <strong>annual fee</strong> ($15 to $300 depending on the card, and plenty of cards charge nothing), the <strong>late fee</strong> ($30 to $35, charged monthly), and the <strong>over-limit fee</strong> (up to $35 for spending past your limit). The late fee is the one to kill first. Turn on autopay for the minimum, then pay the statement balance yourself. The autopay is insurance against a bad week, not the plan.</p>`,
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'explorer',
        explorer: 'minimum',
        id: 'pa-5-3',
        prompt: 'What the minimum payment actually costs.',
        body: `Start at $1,200 and ${pct(R.averageCarriedCardAPR)} — roughly a semester of textbooks plus a laptop repair.`,
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'sandbox',
        mode: 'card',
        id: 'pa-5-4',
        prompt: 'Put real purchases on your sandbox card and watch utilization move.',
        body:
          'Each button sends a <code>POST /accounts/{id}/purchases</code> to Nessie. The balance and the band come back from the API, not from a variable in this page.',
      },
    ],
  },

  // =========================================================================
  {
    id: 'student-loans',
    number: 6,
    title: 'Student loans, and how to pay debt down',
    objective: 'Work out a loan payment, and compare two payoff strategies.',
    blocks: [
      {
        kind: 'prose',
        html: `<p>A student loan is usually the first serious debt anyone takes on, and it's taken on at the age when you know the least about debt. Three mechanics cause most of the surprises.</p>
        <p><strong>Subsidized or unsubsidized.</strong> On a subsidized federal loan the government covers your interest while you're enrolled at least half time. On an unsubsidized loan interest starts accruing the day the money is disbursed, including every semester you're still in school.</p>
        <p><strong>Capitalization.</strong> When you enter repayment, the unpaid interest that has piled up gets added to your principal. From that point you're paying interest on interest. It's why an unsubsidized balance at graduation is bigger than the sum of what you borrowed.</p>
        <p><strong>The origination fee.</strong> Federal Direct loans take about ${pct(R.federalLoanOriginationFee, 2)} off the top before the money reaches your school. Borrow $5,500 and roughly ${usd(5441.87, { cents: true })} arrives. You owe the full $5,500.</p>
        <p>Federal loans have one real advantage over private ones and it's worth knowing before you sign anything: the rate is fixed by law and can't change, and if you can't afford the standard payment later you can ask your servicer about an income-driven plan. Private lenders are under no obligation to offer you either.</p>`,
      },
      {
        kind: 'figures',
        items: [
          { value: pct(R.federalUndergradLoanAPR, 2), label: 'Undergraduate', note: 'Direct Subsidized & Unsubsidized, 2026–27, fixed' },
          { value: pct(R.federalGradLoanAPR, 2), label: 'Graduate', note: 'Direct Unsubsidized, 2026–27' },
          { value: pct(R.federalPlusLoanAPR, 2), label: 'PLUS', note: 'Parent and Grad PLUS, 2026–27' },
        ],
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'mcq',
        id: 'pa-6-1',
        prompt:
          'Dani borrows $6,000 unsubsidized as a freshman and makes no payments while she\'s enrolled. Four years later she graduates. What\'s true?',
        options: [
          { id: 'a', label: 'She owes $6,000. Interest starts when repayment starts.', correct: false, feedback: 'That\'s how a subsidized loan works. Unsubsidized interest starts on the day the money is disbursed, and it ran through every semester she was enrolled.' },
          { id: 'b', label: 'She owes more than $6,000, and the extra becomes part of the principal.', correct: true, feedback: `Four years at ${pct(R.federalUndergradLoanAPR, 2)} adds roughly $1,565 of interest. At repayment it capitalizes — it becomes principal — and she starts paying interest on that interest.` },
          { id: 'c', label: 'The interest is forgiven because she stayed enrolled.', correct: false, feedback: 'Being enrolled postpones the payments. It doesn\'t stop the interest, and nothing is forgiven.' },
          { id: 'd', label: 'She owes $6,000 plus a late fee.', correct: false, feedback: 'No payment was due, so there\'s no late fee. Just four years of interest quietly adding up.' },
        ],
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'explorer',
        explorer: 'loan',
        id: 'pa-6-2',
        prompt: 'Your loan, amortized.',
        body:
          'Start at $27,000, which is close to the median federal debt at graduation, on the standard ten-year plan. Then move the <em>extra per month</em> slider and watch the term, not just the total.',
      },
      {
        kind: 'activity',
        tier: 'challenge',
        kind: 'numeric',
        id: 'ca-6-3',
        prompt: `What\'s the monthly payment on $27,000 at ${pct(R.federalUndergradLoanAPR, 2)} over the standard ten-year term? To the nearest dollar.`,
        answer: 307,
        tolerance: 2,
        prefix: '$',
        hint: 'M = P·r ÷ (1 − (1+r)⁻ⁿ), where r is the monthly rate and n is 120 months. Or just use the explorer above.',
        distractors: [
          { value: 225, feedback: 'That\'s $27,000 ÷ 120, which is principal only. You\'ve left out ten years of interest.' },
          { value: 3683, feedback: 'That\'s the yearly figure. The question asks for monthly.' },
          { value: 147, feedback: 'Check your rate — that looks like a much longer term or a much lower rate.' },
        ],
        solution:
          'About <strong>$306.86 a month</strong>. That\'s $36,823 paid back on $27,000 borrowed, of which <strong>$9,822 is interest</strong>. Adding $50 a month clears it 22 months early and saves $1,952.',
      },
      {
        kind: 'prose',
        html: `<p>Loans rarely arrive alone, and once you have more than one, the question becomes which to attack. Ross lays out the two standard answers, and the honest summary is that they disagree about what's actually holding you back.</p>
        <p><strong>Debt snowball</strong> pays the smallest balance first. It costs you more in interest, and it works, because clearing an account entirely is the thing that convinces people to keep going.</p>
        <p><strong>Debt avalanche</strong> pays the highest rate first. It's cheaper, sometimes by a lot, and its weakness is that the first debt can take a long time to disappear, which is hard on motivation.</p>
        <p>There's a third option worth knowing about: <strong>consolidation</strong>, where several debts become one at a lower rate. It simplifies things and it usually requires decent credit to qualify for, which most students don't have yet.</p>`,
      },
      {
        kind: 'activity',
        tier: 'challenge',
        kind: 'mcq',
        id: 'ca-6-4',
        prompt:
          'Three cards. Card A: $400 at 17.99%. Card B: $2,000 at 24.99%. Card C: $5,000 at 21.99%. You pay every minimum, and you have $150 spare each month to throw at one of them. Snowball says pay A first. Avalanche says pay B first. Over the whole payoff, what does choosing avalanche get you?',
        options: [
          { id: 'a', label: 'About $217 less interest, and done 2 months sooner.', correct: true, feedback: 'Snowball finishes in 39 months having paid $2,868 in interest. Avalanche finishes in 37 months having paid $2,651. A real difference, and smaller than most people expect — which is the actual point. If clearing Card A in three months is what keeps you going, snowball is worth $217.' },
          { id: 'b', label: 'About $1,500 less interest. Avalanche is always dramatically cheaper.', correct: false, feedback: 'Overstated. With these balances and rates the gap is around $217. Avalanche wins, but the margin is usually smaller than its reputation.' },
          { id: 'c', label: 'Nothing. The two strategies cost the same.', correct: false, feedback: 'Not quite the same. Avalanche saves $217 and two months here, because it kills the 24.99% balance before it kills the small one.' },
          { id: 'd', label: 'Avalanche is slower but cheaper.', correct: false, feedback: 'It\'s both cheaper and slightly faster here. Interest you don\'t pay is money that goes to principal instead, so the two usually move together.' },
        ],
        closing:
          'Neither answer is wrong. Pick avalanche if the math motivates you and snowball if finishing things does, and know what the choice costs.',
      },
      {
        kind: 'callout',
        tone: 'bos',
        title: 'Dr. Bos on the question I won\'t answer',
        html: `<p>Students ask me whether they should pay extra on a ${pct(R.federalUndergradLoanAPR, 2)} loan or invest that money instead, and they want a number back. I'm not going to give you one.</p>
        <p>Extra principal earns you a guaranteed ${pct(R.federalUndergradLoanAPR, 2)}. Investing has a higher expected return and no guarantee at all. Both answers are defensible, and which is right for you depends on how steady your income is, whether you're working toward loan forgiveness, and frankly how well you sleep with debt on the books. I don't know any of that.</p>
        <p>What I will say is that you can now price both sides yourself. That means when someone confidently tells you the answer, you can check whether they did the same.</p>`,
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'sandbox',
        mode: 'loan',
        id: 'pa-6-5',
        prompt: 'Record the loan on your sandbox portfolio.',
        body:
          'This sends <code>POST /accounts/{id}/loans</code> with the monthly payment your own amortization produced, so the number in the bank is the number you worked out.',
      },
    ],
  },

  // =========================================================================
  {
    id: 'capstone',
    number: 7,
    title: 'Put it together',
    objective: 'Build a monthly plan across all five layers and defend it.',
    blocks: [
      {
        kind: 'prose',
        html: `<p>Everything so far was a piece. This is the assembly.</p>
        <p>There's no single right answer below, and the checker doesn't pretend there is. It applies the rules from this lesson — cover the bottom layer, don't spend money you don't have, clear expensive debt before chasing returns, don't leave dollars unassigned — and tells you which ones your plan breaks. Two very different plans can both pass.</p>`,
      },
      {
        kind: 'activity',
        tier: 'challenge',
        kind: 'allocate',
        id: 'ca-7-1',
        prompt: 'Give every dollar of Jordan\'s month a job.',
        scenario: {
          name: 'Jordan, junior year',
          income: 1240,
          incomeNote: 'Campus job $860 + research stipend $380',
          essentials: 935,
          essentialsBreakdown: [
            { label: 'Rent (shared)', amount: 600 },
            { label: 'Food', amount: 260 },
            { label: 'Transit', amount: 40 },
            { label: 'Phone', amount: 35 },
          ],
          savings: 415,
          cardBalance: 180,
          cardLimit: 700,
          cardAPR: R.averageCarriedCardAPR,
          loanBalance: 18000,
          loanAPR: R.federalUndergradLoanAPR,
          loanNote: 'Subsidized, so nothing accrues until six months after graduation',
          investments: 0,
          emergencyTargetMonths: 3,
        },
      },
      {
        kind: 'activity',
        tier: 'participation',
        kind: 'sandbox',
        mode: 'portfolio',
        id: 'pa-7-2',
        prompt: 'Your portfolio, read back from the bank.',
        body:
          'Net worth, spending by category and utilization, worked out from whatever is actually sitting in your Nessie accounts right now. This is the same view that follows you into Bubu\'s world.',
      },
      {
        kind: 'callout',
        tone: 'bos',
        title: 'What happens next',
        html: `<p>The accounts you opened, the purchases you made and the loan you recorded all stay in the sandbox. When you walk into the bank in Bubu's world, the teller is looking at this portfolio, not a blank one.</p>
        <p>That's the reason this lesson runs against a real banking API instead of a worksheet. What you did here follows you.</p>`,
      },
    ],
  },
];

/** Block kinds that are activities at all (the renderer switches on `kind`). */
export const ACTIVITY_KINDS = ['sort', 'order', 'match', 'mcq', 'numeric', 'explorer', 'sandbox', 'allocate'];

/** Activities that produce a score — these drive the progress rail and mastery bar. */
export const GRADED_KINDS = ['sort', 'order', 'match', 'mcq', 'numeric', 'allocate'];

export const isActivity = (block) => ACTIVITY_KINDS.includes(block.kind);
export const isGraded = (block) => GRADED_KINDS.includes(block.kind);

export const gradedActivities = sections.flatMap((s) =>
  s.blocks.filter(isGraded).map((b) => ({ sectionId: s.id, id: b.id, tier: b.tier, kind: b.kind }))
);

/** Activity numbering: "Participation Activity 3.2" the way a zyBook labels them. */
export const activityLabels = (() => {
  const map = {};
  for (const s of sections) {
    let n = 0;
    for (const b of s.blocks) {
      if (!isActivity(b)) continue;
      n += 1;
      map[b.id] = {
        number: `${s.number}.${n}`,
        tier: b.tier,
        label: `${b.tier === 'challenge' ? 'Challenge' : 'Participation'} Activity ${s.number}.${n}`,
      };
    }
  }
  return map;
})();

export default { lessonMeta, sections, gradedActivities, activityLabels, isActivity, isGraded };
