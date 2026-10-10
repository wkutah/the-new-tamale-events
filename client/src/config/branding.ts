import { City } from '../types';

export const BRANDING = {
  appName: 'The New Tamale Events',
  shortName: 'TamaleEvents',
  tagline: 'The Heartbeat of Entertainment in Northern Ghana',
  subTagline: 'Discover concerts, nightlife, cultural festivals, comedy & campus vibes across Tamale, Damongo, Bolgatanga, Wa, and communities across Ghana.',
  foundedYear: '2026',
  
  // Popular Northern Hubs & Open Locations
  popularCities: [
    'Tamale',
    'Damongo',
    'Bolgatanga',
    'Wa',
    'Yendi',
    'Navrongo',
    'Nalerigu',
    'Walewale',
    'Bawku',
    'Salaga',
    'Bimbilla',
    'Jirapa',
    'Lawra',
    'Tumu',
    'Bole',
    'Nyankpala'
  ],

  // Target Cities featured configuration
  cities: [
    {
      id: 'Tamale' as City,
      name: 'Tamale',
      region: 'Northern Region',
      tagline: 'The Cultural & Entertainment Capital',
      accentColor: '#f59e0b', // Amber Gold
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      description: 'Northern Ghana’s premier metropolis—vibrant music stadium concerts, thriving night street markets, and modern cultural vibes.',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'Damongo' as City,
      name: 'Damongo',
      region: 'Savannah Region',
      tagline: 'Mole Safari Beats & Royal Gonja Heritage',
      accentColor: '#10b981', // Emerald
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      description: 'Lush savannah landscapes, Mole National Park campfire jams, traditional Gonja drumming, and eco-tourism adventures.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'Bolgatanga' as City,
      name: 'Bolgatanga',
      region: 'Upper East Region',
      tagline: 'Craft Capital & Sunset Highlife Grooves',
      accentColor: '#f43f5e', // Rose Coral
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      description: 'Internationally famous basketry craft fairs, rock garden outdoor festivals, comedy nights, and warm Upper East hospitality.',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'Wa' as City,
      name: 'Wa',
      region: 'Upper West Region',
      tagline: 'Royal Wala Palaces & Dynamic Campus Raves',
      accentColor: '#8b5cf6', // Violet
      badgeClass: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
      description: 'Iconic Sudanese royal palace festivals, vibrant university campus concerts, xylophone masters, and energetic DJ nights.',
      image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80'
    }
  ],

  categories: [
    { id: 'Concert', name: 'Concerts & Live Music', icon: 'Music' },
    { id: 'Nightlife', name: 'Nightlife & Lounges', icon: 'PartyPopper' },
    { id: 'Cultural', name: 'Cultural Celebrations', icon: 'Sparkles' },
    { id: 'Festival', name: 'Festivals & Fairs', icon: 'Flame' },
    { id: 'Comedy', name: 'Comedy & Theatre', icon: 'Smile' },
    { id: 'Campus', name: 'Campus & Youth Raves', icon: 'GraduationCap' },
    { id: 'Conference', name: 'Tech & Creator Summits', icon: 'Cpu' }
  ],

  contact: {
    email: 'info@newtamaleevents.com',
    phone: '+233 24 000 0001',
    whatsapp: '+233 24 000 0001',
    location: 'Tamale, Northern Region, Ghana',
    instagram: '@newtamaleevents',
    twitter: '@newtamaleevents',
    facebook: 'The New Tamale Events'
  }
};
