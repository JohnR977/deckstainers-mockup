// Service pages. Copy reads like the owner talking; prices come from config.
import { money } from '../lib/layout.mjs';

export function services(cfg) {
  const p = cfg.pricing;
  const semi = p.finishes['semi-transparent'];
  const city = cfg.business.city;
  return [
    {
      slug: 'deck-staining',
      name: 'Deck Staining',
      photo: 'staining',
      title: `Deck Staining in ${city}, ${cfg.business.state}`,
      description: `Professional deck staining in ${city}: low-pressure wash, brightener, two coats brushed in by hand. Sample pricing from ${money(semi.low, 2)}/sq ft. Free photo estimates.`,
      kicker: 'Our main job',
      lede: 'We wash, we brighten, we stain. Most decks take two days.',
      intro: `Most decks we see around ${city} aren't ruined. They're gray, a little rough, maybe green on the shady side. Under that is good wood that just needs the right prep and a stain that soaks in.`,
      included: [
        ['Protect', 'Cover plants, siding and anything we don\'t want stain on. Move furniture and grills (and put them back).'],
        ['Wash', 'Low-pressure wash with a cleaner that lifts gray and mildew. No blasting soft wood.'],
        ['Brighten', 'Brightener evens out the color and opens the grain so stain soaks in evenly.'],
        ['Dry', 'We let it dry. Usually overnight at least, longer in shade. This is the step most people rush.'],
        ['Stain', 'Penetrating stain, applied and back-brushed board by board. Rails and spindles by hand.'],
        ['Walk-through', 'We walk it with you, touch up anything you point out, and leave care instructions.']
      ],
      faqs: [
        { q: 'How long until we can use the deck?', a: 'Light foot traffic usually the next day. Furniture back in 24–48 hours depending on the product and weather. We\'ll tell you for your exact stain.' },
        { q: 'Do you sand?', a: 'Only where it helps: raised grain, rough patches, splinters. Sanding a whole deck smooth can actually keep stain from soaking in, so we don\'t do it by default.' },
        { q: 'What if it rains?', a: 'We watch the forecast closely and reschedule if needed. If rain surprises us before the stain sets, we come back and fix it. That\'s on us.' }
      ]
    },
    {
      slug: 'deck-cleaning-restoration',
      name: 'Deck Cleaning & Restoration',
      photo: 'cleaning',
      title: `Deck Cleaning & Restoration in ${city} — Wash, Strip, Brighten, Sand`,
      description: `Deck restoration in ${city}: remove peeling stain, clean mildew, brighten gray wood and sand rough boards — then seal it right. Photo estimates.`,
      kicker: 'Wash · Strip · Brighten · Sand',
      lede: 'Gray, green or peeling? That deck can come back.',
      intro: 'Restoration is everything that happens before the stain goes on. It\'s the difference between a finish that lasts and one that peels by next summer.',
      included: [
        ['Wash', 'For faded and mildewed decks: a cleaner that kills the green and lifts the gray, rinsed at low pressure.'],
        ['Strip', 'For peeling or failing finish: a stripper that softens the old coat so it rinses off without gouging the wood.'],
        ['Brighten', 'Neutralizes the stripper or cleaner and brings the wood back to an even, fresh color.'],
        ['Sand', 'Spot-sanding for raised grain, splinters and rough board ends.'],
        ['Repair', 'Reset popped nails, swap cracked boards, tighten loose rails. Priced per item, no surprises.'],
        ['Seal', 'Finish with the right stain for your wood and how you use the deck.']
      ],
      faqs: [
        { q: 'Why not just pressure-wash it?', a: 'High pressure tears up soft wood. The U.S. Forest Products Lab warns that power washing can remove wood from the surface. We use cleaners and low pressure instead.' },
        { q: 'How do I know if mine needs stripping?', a: 'If the old coat is peeling, flaking or blotchy, it needs to come off. If it\'s just faded and gray, a wash and brightener is usually enough. Photos tell us a lot.' },
        { q: 'Can you fix a few bad boards?', a: 'Yes. We replace individual boards and note them on the estimate. For structural problems (posts, joists, ledger), we\'ll tell you and refer you to a deck builder.' }
      ]
    },
    {
      slug: 'fence-staining',
      name: 'Fence Staining',
      photo: 'fence',
      title: `Fence Staining in ${city} — Privacy, Picket & Board Fences`,
      description: `Wood fence staining in ${city}. We spray and back-brush both sides so stain soaks in. Bundle with your deck to save on setup.`,
      kicker: 'Privacy · Picket · Board',
      lede: 'Fences are vertical, so a good stain lasts longer on them than on a deck floor.',
      intro: 'A wood fence is a lot of square footage, and most of it has never been sealed. Done right once, a fence stays easy to keep up.',
      included: [
        ['Clean', 'Wash off gray, mildew and dirt so the stain soaks into wood, not grime.'],
        ['Protect', 'Cover plants, AC units, cars and the neighbor\'s side if we\'re only doing yours.'],
        ['Spray & back-brush', 'We spray to cover fast, then brush it in. Spray-only jobs look fine for a season and then fade unevenly.'],
        ['Both sides', 'Priced per side. Ask your neighbor. Many split the cost of the other side.']
      ],
      faqs: [
        { q: 'How is fence staining priced?', a: 'By the linear foot and height, per side. Send a photo and the rough length and we\'ll give you a range.' },
        { q: 'Can my fence match my deck?', a: 'Yes, but fences and decks often look different with the same stain because the wood and sun are different. We\'ll test it first.' }
      ]
    },
    {
      slug: 'log-home-staining',
      name: 'Log Home & Cabin Staining',
      photo: 'loghome',
      title: `Log Home & Cabin Staining in ${city} and the Mountains`,
      description: `Log home and cabin staining around ${city}: cleaning, old finish removal, and stain made for logs. ${cfg.location.cabinAreas}.`,
      kicker: 'Logs · Half-log siding · Cabins',
      lede: 'Logs move, check and drink stain. They need their own plan.',
      intro: 'Log walls take more weather than a deck rail and soak up more stain than you\'d guess. We clean them, deal with the old finish, and stain them so water runs off instead of in.',
      included: [
        ['Inspect', 'Look for soft spots, open checks on the top side of logs, and chinking gaps. We\'ll show you what we find.'],
        ['Clean', 'Gentle wash for dirt, pollen and mildew. Strip failing finish where needed.'],
        ['Stain', 'A log-home stain applied heavy enough to protect and brushed into checks and end grain.'],
        ['Trim & porches', 'Doors, window trim, porch posts and decks matched to the walls.']
      ],
      faqs: [
        { q: 'How often do log homes need restaining?', a: 'It depends on sun, overhangs and the product. South and west walls wear fastest. We\'ll look at each side and tell you which ones need it now.' },
        { q: 'Do you do chinking?', a: 'We handle small chinking repairs as part of a stain job. For a full re-chink we\'ll refer you to a specialist.' }
      ]
    },
    {
      slug: 'pergolas-porches',
      name: 'Pergolas, Porches & Gazebos',
      photo: 'pergola',
      title: `Pergola, Porch & Gazebo Staining in ${city}`,
      description: `Staining for pergolas, porches, gazebos, arbors and swing sets in ${city}. Hand-brushed posts and beams, matched to your deck.`,
      kicker: 'Pergolas · Porches · Gazebos · Arbors',
      lede: 'All the posts, beams and slats that a sprayer misses.',
      intro: 'Pergolas and gazebos have a lot of edges and end grain, and that\'s where water gets in. We take the time to brush every face, including the tops of beams you can\'t see from the ground.',
      included: [
        ['Overhead work', 'Ladders and staging for beams and rafters. We protect the floor and furniture underneath.'],
        ['End grain first', 'Cut ends soak up water the fastest, so we seal them first and heaviest.'],
        ['Porch floors', 'Covered porch floors get a finish suited to foot traffic and the occasional muddy boot.'],
        ['Match the deck', 'If we\'re doing the deck too, we\'ll match or coordinate colors.']
      ],
      faqs: [
        { q: 'Can you stain a cedar swing set or playset?', a: 'Yes. We use a product suited to it and let it cure properly before the kids are back on it.' },
        { q: 'My porch floor is painted. Can you stain it?', a: 'Sometimes. Tongue-and-groove porch floors are often meant to be painted. We\'ll tell you honestly which finish fits.' }
      ]
    },
    {
      slug: 'maintenance-plans',
      name: 'Maintenance Plans',
      photo: 'maintenance',
      title: `Deck Maintenance Plans in ${city} — Prices Shown`,
      description: `Deck maintenance plans in ${city} with real prices: yearly check-ups and maintenance coats every 2–3 years so you never pay to strip a deck again.`,
      kicker: 'Prices shown — no phone tag',
      lede: 'The cheapest deck to stain is one that never needs stripping.',
      intro: 'A maintenance coat on a faded deck costs a fraction of a full restoration. The trick is doing it on time. Pick a plan and we keep track of it for you.',
      plans: true,
      included: [
        ['We remember', 'We track when your deck was done and reach out before it\'s due. You don\'t have to think about it.'],
        ['Same color, same product', 'We keep notes on exactly what\'s on your deck, so every coat matches.'],
        ['Priority dates', 'Plan customers get first pick of fall dates, our busiest season.'],
        ['Warranty stays active', 'Staying on schedule keeps your warranty going.']
      ],
      faqs: [
        { q: 'What\'s the difference between a maintenance coat and a full job?', a: 'A full job may include stripping, heavy cleaning, brightening and two coats. A maintenance coat is a gentle wash and one fresh coat over finish that\'s still sound. It\'s faster and costs much less.' },
        { q: 'Can I cancel?', a: 'Yes. Yearly plans can be cancelled any time before the next visit is booked. Monthly plans can be cancelled with 30 days\' notice.' },
        { q: 'Are these real prices?', a: 'On this demo site they are sample prices. Each Pro Partner sets their own in the site settings.' }
      ]
    }
  ];
}
