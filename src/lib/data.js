// ── BRAND TOKENS ─────────────────────────────────────────────
export const B = {
  navy:       '#1B3054',
  navyLight:  '#243d6b',
  navyDark:   '#111f38',
  green:      '#1E4530',
  greenLight: '#2a5c3f',
  gold:       '#C4963A',
  goldLight:  '#D9AF5A',
  goldPale:   '#F5ECD6',
  cream:      '#F0E8D5',
  creamDark:  '#E5D9C0',
  white:      '#FFFFFF',
  feedBg:     '#F7F4EE',
  textNavy:   '#1B3054',
  textMid:    '#4A5E78',
  textSoft:   '#7A8FA8',
  border:     '#E2D9C8',
}

export const serif = "'Playfair Display', Georgia, serif"
export const sans  = "'DM Sans', system-ui, sans-serif"

export const COURSES = [
  { id:1,  name:'Augusta National Golf Club',    location:'Augusta, GA',          state:'GA', rating:9.8, conditions:9.9, value:7.2, vibes:9.9, reviews:1842, bg:'#1E4530',  icon:'🌿', natRank:1,  stRank:1, par:72, price:'$$$$', lat:33.5,  lng:-82.0,  desc:'The most iconic private club on Earth. Home of The Masters since 1934.' },
  { id:2,  name:'Pebble Beach Golf Links',       location:'Pebble Beach, CA',     state:'CA', rating:9.6, conditions:9.7, value:6.5, vibes:9.8, reviews:3241, bg:'#1B3054',  icon:'🌊', natRank:2,  stRank:1, par:72, price:'$$$$', lat:36.5,  lng:-121.9, desc:'18 holes of ocean-side perfection on the Monterey Peninsula.' },
  { id:3,  name:'Cypress Point Club',            location:'Pebble Beach, CA',     state:'CA', rating:9.5, conditions:9.6, value:7.0, vibes:9.7, reviews:987,  bg:'#1a3030',  icon:'🌲', natRank:3,  stRank:2, par:72, price:'$$$$', lat:36.6,  lng:-121.9, desc:"MacKenzie's masterpiece. Exclusive, jaw-dropping, unforgettable." },
  { id:4,  name:'Shinnecock Hills Golf Club',    location:'Southampton, NY',       state:'NY', rating:9.4, conditions:9.5, value:7.1, vibes:9.4, reviews:1204, bg:'#2a2a1a',  icon:'🏌️', natRank:4,  stRank:1, par:70, price:'$$$$', lat:40.9,  lng:-72.4,  desc:'Wind-swept links golf on the East End of Long Island.' },
  { id:5,  name:'Oakmont Country Club',          location:'Oakmont, PA',           state:'PA', rating:9.3, conditions:9.5, value:7.4, vibes:9.1, reviews:1567, bg:'#1a2530',  icon:'⛳', natRank:5,  stRank:1, par:70, price:'$$$$', lat:40.5,  lng:-79.8,  desc:"America's toughest course. Church pew bunkers. Historic US Open venue." },
  { id:6,  name:'TPC Sawgrass (Stadium)',        location:'Ponte Vedra Beach, FL', state:'FL', rating:8.9, conditions:9.0, value:8.2, vibes:9.2, reviews:4521, bg:'#1a2e20',  icon:'🏝️', natRank:8,  stRank:1, par:72, price:'$$$',  lat:30.2,  lng:-81.4,  desc:'Home of The Players. The island 17th is the most watched hole in golf.' },
  { id:7,  name:'Bandon Dunes',                  location:'Bandon, OR',            state:'OR', rating:9.4, conditions:9.2, value:8.8, vibes:9.7, reviews:2834, bg:'#1e3028',  icon:'🌬️', natRank:12, stRank:1, par:72, price:'$$$',  lat:43.1,  lng:-124.4, desc:'Pure golf on the Oregon coast. Walking only. No houses. No distractions.' },
  { id:8,  name:'Bethpage Black',                location:'Farmingdale, NY',       state:'NY', rating:8.8, conditions:8.9, value:9.5, vibes:9.0, reviews:5678, bg:'#181818',  icon:'⚫', natRank:18, stRank:2, par:71, price:'$',    lat:40.7,  lng:-73.4,  desc:"A $50 US Open venue. The people's course. Bring snacks." },
  { id:9,  name:'Merion Golf Club (East)',       location:'Ardmore, PA',           state:'PA', rating:9.2, conditions:9.3, value:7.6, vibes:9.0, reviews:1123, bg:'#252510',  icon:'🌾', natRank:6,  stRank:2, par:70, price:'$$$$', lat:40.0,  lng:-75.3,  desc:'Wicker baskets. Tiny greens. Historic Main Line drama.' },
  { id:10, name:'Winged Foot Golf Club (West)',  location:'Mamaroneck, NY',        state:'NY', rating:9.1, conditions:9.2, value:7.3, vibes:9.0, reviews:1456, bg:'#1a2535',  icon:'🦅', natRank:7,  stRank:3, par:72, price:'$$$$', lat:41.0,  lng:-73.7,  desc:"Five US Opens. Thick rough. The Northeast's most feared club." },
]

export const FEED = [
  { id:1, user:'Tyler M.',  avatar:'TM', rating:9.5, conditions:9.8, value:8.0, vibes:9.5, comment:"Absolutely world class. Fairways like velvet — nothing I've played compares.", date:'2d ago',  score:78, course:'Augusta National Golf Club',  likes:24 },
  { id:2, user:'Sarah K.',  avatar:'SK', rating:9.2, conditions:9.0, value:7.5, vibes:9.8, comment:'Every hole is a postcard. The 18th finishing over Stillwater Cove is a memory forever.', date:'4d ago',  score:84, course:'Pebble Beach Golf Links',      likes:31 },
  { id:3, user:'James R.',  avatar:'JR', rating:8.8, conditions:8.5, value:9.9, vibes:9.0, comment:'$50 for a US Open venue. Sign me up every single time.', date:'1w ago',  score:91, course:'Bethpage Black',               likes:47 },
  { id:4, user:'Mike D.',   avatar:'MD', rating:9.7, conditions:9.4, value:8.8, vibes:9.9, comment:'Island green on 17 — hit it to 4 feet, drained the putt. Best sporting moment of my life.', date:'1w ago',  score:82, course:'TPC Sawgrass (Stadium)',       likes:58 },
  { id:5, user:'Emma L.',   avatar:'EL', rating:9.4, conditions:9.5, value:9.0, vibes:9.7, comment:'Bandon is a different planet. Pure walking golf on the Oregon coast. Bucket list complete.', date:'2w ago', score:88, course:'Bandon Dunes',                likes:39 },
  { id:6, user:'Chris W.',  avatar:'CW', rating:9.0, conditions:8.8, value:8.5, vibes:9.2, comment:'Oakmont will humble you fast. Church pew bunkers ate my ball twice.', date:'3w ago', score:97, course:'Oakmont Country Club',         likes:22 },
]

export const MY_ROUNDS = [
  { course:'Pebble Beach Golf Links',    date:'Mar 2024', score:84, rating:9.2 },
  { course:'TPC Sawgrass (Stadium)',     date:'Jan 2024', score:82, rating:9.7 },
  { course:'Bethpage Black',             date:'Oct 2023', score:91, rating:8.8 },
  { course:'Bandon Dunes',               date:'Sep 2023', score:88, rating:9.4 },
  { course:'Shinnecock Hills Golf Club', date:'Jul 2023', score:79, rating:9.1 },
]

export const WISHLIST = [
  { course:'Augusta National Golf Club', priority:'Dream Round' },
  { course:'Cypress Point Club',         priority:'Top Priority' },
  { course:'Merion Golf Club (East)',    priority:'This Year' },
]

export const NAV_TABS = [
  { id:'discover', label:'Discover', icon:'🔍' },
  { id:'feed',     label:'Feed',     icon:'📋' },
  { id:'rankings', label:'Rankings', icon:'🏆' },
  { id:'map',      label:'Map',      icon:'🗺️'  },
  { id:'profile',  label:'Profile',  icon:'👤' },
]
