export interface TagEvent {
  id: string
  date: string
  dateISO: string
  title: string
  type: 'TAG Night' | 'TAG Team' | 'TAG Drop' | 'Hackathon' | 'Build Sprint'
  description: string
  location: string
}

const events: TagEvent[] = [
  {
    id: 'tag-night-5',
    date: 'MAR 27',
    dateISO: '2026-03-27',
    title: 'Build Fast Earn Fast',
    type: 'Hackathon',
    description: '24-hour hackathon. Build something real, pitch it, win.',
    location: 'TAG HQ, Amsterdam',
  },
  {
    id: 'tag-night-6',
    date: 'APR 10',
    dateISO: '2026-04-10',
    title: 'Demo Night #4',
    type: 'TAG Night',
    description: 'Builders demo what they shipped. 5 minutes, no slides, just product.',
    location: 'TAG HQ, Amsterdam',
  },
  {
    id: 'tag-sprint-2',
    date: 'APR 24',
    dateISO: '2026-04-24',
    title: 'Ship Sprint Weekend',
    type: 'Build Sprint',
    description: 'Two days, one goal: ship something. Bring your project or start fresh.',
    location: 'TAG HQ, Amsterdam',
  },
  {
    id: 'tag-night-7',
    date: 'MAY 08',
    dateISO: '2026-05-08',
    title: 'Demo Night #5',
    type: 'TAG Night',
    description: 'Monthly showcase. Show what you built, get feedback from builders.',
    location: 'TAG HQ, Amsterdam',
  },
  {
    id: 'tag-drop-1',
    date: 'MAY 22',
    dateISO: '2026-05-22',
    title: 'TAG Drop: AI Tools',
    type: 'TAG Drop',
    description: 'Curated deep-dive into the tools builders are actually using.',
    location: 'TAG HQ, Amsterdam',
  },
]

const pastEvents: TagEvent[] = [
  {
    id: 'tag-night-4',
    date: 'MAR 13',
    dateISO: '2026-03-13',
    title: 'Demo Night #3',
    type: 'TAG Night',
    description: 'Five builders showed what they shipped. Standing room only.',
    location: 'TAG HQ, Amsterdam',
  },
  {
    id: 'tag-night-3',
    date: 'FEB 27',
    dateISO: '2026-02-27',
    title: 'Demo Night #2',
    type: 'TAG Night',
    description: 'Second showcase night. Three projects launched live on stage.',
    location: 'TAG HQ, Amsterdam',
  },
  {
    id: 'tag-team-1',
    date: 'FEB 13',
    dateISO: '2026-02-13',
    title: 'TAG Team: Find Your Cofounder',
    type: 'TAG Team',
    description: 'Speed-matching for builders looking for their other half.',
    location: 'TAG HQ, Amsterdam',
  },
]

export const getUpcomingEvents = (): TagEvent[] => {
  return events.filter((e) => new Date(e.dateISO) >= new Date())
}

export const getPastEvents = (): TagEvent[] => {
  return pastEvents
}

export const getAllEvents = (): TagEvent[] => {
  return [...events, ...pastEvents]
}
