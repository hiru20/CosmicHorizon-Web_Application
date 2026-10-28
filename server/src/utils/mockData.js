/**
 * Academic & Viva Fallback Mock Data
 * Ensures CosmicHorizon operates seamlessly even during network outages or external API rate limits (HTTP 429).
 */

export const mockIssData = {
  name: 'iss',
  id: 25544,
  latitude: 28.5721,
  longitude: -80.6480,
  altitude: 418.5, // km
  velocity: 27600.2, // km/h
  visibility: 'daylight',
  footprint: 4500.8,
  timestamp: Math.floor(Date.now() / 1000),
  daynum: 2460000.5,
  solar_lat: 10.2,
  solar_lon: -70.4,
  units: 'kilometers',
  isFallback: true,
};

export const mockLaunches = [
  {
    id: 'launch-001',
    name: 'Falcon 9 Block 5 | Starlink Group 7-18',
    status: {
      id: 1,
      name: 'Go for Launch',
      abbrev: 'Go',
      description: 'Current conditions are favorable for launch.',
    },
    net: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // ~18 hours from now
    window_start: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    window_end: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
    launch_service_provider: {
      id: 121,
      name: 'SpaceX',
      type: 'Commercial',
      country_code: 'USA',
    },
    rocket: {
      id: 188,
      configuration: {
        id: 164,
        name: 'Falcon 9',
        family: 'Falcon',
        full_name: 'Falcon 9 Block 5',
        variant: 'Block 5',
      },
    },
    mission: {
      id: 6100,
      name: 'Starlink Group 7-18',
      description: 'A batch of 23 satellites for Starlink mega-constellation - SpaceX\'s project for space-based Internet communication system.',
      type: 'Communications',
      orbit: {
        id: 8,
        name: 'Low Earth Orbit',
        abbrev: 'LEO',
      },
    },
    pad: {
      id: 80,
      name: 'Space Launch Complex 40',
      location: {
        id: 12,
        name: 'Cape Canaveral SFS, FL, USA',
        country_code: 'USA',
      },
    },
    image: 'https://images.unsplash.com/photo-1517976487502-53b7c2fb2b6a?w=800&auto=format&fit=crop&q=80',
    webcast_live: true,
    isFallback: true,
  },
  {
    id: 'launch-002',
    name: 'Atlas V 551 | KuiperSat Mission 1',
    status: {
      id: 1,
      name: 'Go for Launch',
      abbrev: 'Go',
      description: 'Payload is integrated, launch countdown active.',
    },
    net: new Date(Date.now() + 1000 * 60 * 60 * 74).toISOString(), // ~3 days from now
    window_start: new Date(Date.now() + 1000 * 60 * 60 * 74).toISOString(),
    window_end: new Date(Date.now() + 1000 * 60 * 60 * 76).toISOString(),
    launch_service_provider: {
      id: 124,
      name: 'United Launch Alliance (ULA)',
      type: 'Commercial',
      country_code: 'USA',
    },
    rocket: {
      id: 195,
      configuration: {
        id: 170,
        name: 'Atlas V 551',
        family: 'Atlas',
        full_name: 'Atlas V 551',
        variant: '551',
      },
    },
    mission: {
      id: 6102,
      name: 'Project Kuiper Constellation 1',
      description: 'Deployment of satellite communications hardware to Low Earth Orbit.',
      type: 'Communications',
      orbit: {
        id: 8,
        name: 'Low Earth Orbit',
        abbrev: 'LEO',
      },
    },
    pad: {
      id: 88,
      name: 'Space Launch Complex 41',
      location: {
        id: 12,
        name: 'Cape Canaveral SFS, FL, USA',
        country_code: 'USA',
      },
    },
    image: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&auto=format&fit=crop&q=80',
    webcast_live: false,
    isFallback: true,
  },
  {
    id: 'launch-003',
    name: 'Ariane 62 | EarthCARE Atmospheric Observer',
    status: {
      id: 2,
      name: 'To Be Determined',
      abbrev: 'TBD',
      description: 'Launch window pending final range clearance.',
    },
    net: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    window_start: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    window_end: new Date(Date.now() + 1000 * 60 * 60 * 124).toISOString(),
    launch_service_provider: {
      id: 115,
      name: 'Arianespace',
      type: 'Commercial',
      country_code: 'FRA',
    },
    rocket: {
      id: 201,
      configuration: {
        id: 182,
        name: 'Ariane 6',
        family: 'Ariane',
        full_name: 'Ariane 62',
        variant: '62',
      },
    },
    mission: {
      id: 6105,
      name: 'EarthCARE',
      description: 'Joint European Space Agency (ESA) and JAXA mission to improve understanding of the interactions between clouds, aerosols and radiation.',
      type: 'Earth Science',
      orbit: {
        id: 17,
        name: 'Sun-Synchronous Orbit',
        abbrev: 'SSO',
      },
    },
    pad: {
      id: 95,
      name: 'ELA-4',
      location: {
        id: 13,
        name: 'Guiana Space Centre, Kourou, French Guiana',
        country_code: 'GUF',
      },
    },
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    webcast_live: false,
    isFallback: true,
  },
  {
    id: 'launch-004',
    name: 'Electron | "Owl Night Long" Synspective StriX',
    status: {
      id: 1,
      name: 'Go for Launch',
      abbrev: 'Go',
      description: 'Vehicle fueled, range confirmed.',
    },
    net: new Date(Date.now() + 1000 * 60 * 60 * 42).toISOString(),
    window_start: new Date(Date.now() + 1000 * 60 * 60 * 42).toISOString(),
    window_end: new Date(Date.now() + 1000 * 60 * 60 * 44).toISOString(),
    launch_service_provider: {
      id: 147,
      name: 'Rocket Lab',
      type: 'Commercial',
      country_code: 'USA',
    },
    rocket: {
      id: 215,
      configuration: {
        id: 191,
        name: 'Electron',
        family: 'Electron',
        full_name: 'Electron',
        variant: 'Standard',
      },
    },
    mission: {
      id: 6110,
      name: 'StriX-3 Synthetic Aperture Radar',
      description: 'Synthetic Aperture Radar satellite designed to provide high-resolution imagery for all-weather disaster monitoring.',
      type: 'Earth Science',
      orbit: {
        id: 17,
        name: 'Sun-Synchronous Orbit',
        abbrev: 'SSO',
      },
    },
    pad: {
      id: 102,
      name: 'Rocket Lab LC-1A',
      location: {
        id: 20,
        name: 'Mahia Peninsula, New Zealand',
        country_code: 'NZL',
      },
    },
    image: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&auto=format&fit=crop&q=80',
    webcast_live: true,
    isFallback: true,
  }
];

export const mockApodData = {
  date: new Date().toISOString().split('T')[0],
  title: 'The Pillars of Creation in Deep Infrared',
  explanation: 'Star-forming pillars of cold interstellar gas and dust stand tall in the Eagle Nebula (M16), captured here with unprecedented clarity. Infant stars emerge within dense hydrogen gas clouds as intense ultraviolet radiation sculpts the surrounding cosmic landscape. These monumental structures measure several light-years in height and reside roughly 6,500 light-years away in the constellation Serpens.',
  url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&auto=format&fit=crop&q=80',
  hdurl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2400&auto=format&fit=crop&q=80',
  media_type: 'image',
  copyright: 'NASA, ESA, CSA, STScI',
  isFallback: true,
};

export const mockApodPool = [
  mockApodData,
  {
    date: '2022-07-12',
    title: 'Cosmic Cliffs in the Carina Nebula (NGC 3324)',
    explanation: 'What looks like craggy mountains on a moonlit evening is actually the edge of a nearby, young, star-forming region NGC 3324 in the Carina Nebula. Captured in infrared light by the James Webb Space Telescope, this image reveals previously obscured areas of star birth.',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80',
    hdurl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=2400&auto=format&fit=crop&q=80',
    media_type: 'image',
    copyright: 'NASA, ESA, CSA, STScI',
    isFallback: true,
  },
  {
    date: '2021-10-18',
    title: 'Andromeda Galaxy (M31) in Ultraviolet & Infrared',
    explanation: 'The most distant object easily visible to the unaided eye is M31, the great Andromeda Galaxy, some two and a half million light-years away. Spanning over 200,000 light-years across, this spiral galaxy contains roughly one trillion stars.',
    url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=1600&auto=format&fit=crop&q=80',
    hdurl: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=2400&auto=format&fit=crop&q=80',
    media_type: 'image',
    copyright: 'NASA / JPL-Caltech',
    isFallback: true,
  },
  {
    date: '2019-04-10',
    title: 'Supermassive Black Hole in Messier 87',
    explanation: 'Captured by the Event Horizon Telescope, this historic observation reveals the glowing accretion disk and dark central shadow of the supermassive black hole at the core of elliptical galaxy M87, located 55 million light-years from Earth.',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&auto=format&fit=crop&q=80',
    hdurl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=2400&auto=format&fit=crop&q=80',
    media_type: 'image',
    copyright: 'Event Horizon Telescope Collaboration',
    isFallback: true,
  },
  {
    date: '2017-09-15',
    title: 'Cassini Grand Finale: Saturn’s Rings in Shadow',
    explanation: 'Before plunging into Saturn’s atmosphere, the Cassini spacecraft captured this sweeping mosaic of Saturn and its intricate ring system illuminated by sunlight scattering through ice particles.',
    url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1600&auto=format&fit=crop&q=80',
    hdurl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=2400&auto=format&fit=crop&q=80',
    media_type: 'image',
    copyright: 'NASA / JPL-Caltech / Space Science Institute',
    isFallback: true,
  },
  {
    date: '2015-05-04',
    title: 'The Veil Nebula Supernova Remnant',
    explanation: 'Wisps of ionized oxygen, sulfur, and hydrogen glow across the Cygnus Loop, the expanding shockwave from a massive star that exploded roughly 10,000 years ago.',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1600&auto=format&fit=crop&q=80',
    hdurl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=2400&auto=format&fit=crop&q=80',
    media_type: 'image',
    copyright: 'NASA, ESA, Hubble Heritage Team',
    isFallback: true,
  },
];

export const mockMarsData = [
  {
    id: 102685,
    sol: 1000,
    camera: {
      id: 20,
      name: 'FHAZ',
      rover_id: 5,
      full_name: 'Front Hazard Avoidance Camera',
    },
    img_src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    earth_date: '2023-11-20',
    rover: {
      id: 5,
      name: 'Perseverance',
      landing_date: '2021-02-18',
      launch_date: '2020-07-30',
      status: 'active',
    },
  },
  {
    id: 102686,
    sol: 1000,
    camera: {
      id: 22,
      name: 'MAST',
      rover_id: 5,
      full_name: 'Mast Camera (Mastcam-Z)',
    },
    img_src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    earth_date: '2023-11-20',
    rover: {
      id: 5,
      name: 'Perseverance',
      landing_date: '2021-02-18',
      launch_date: '2020-07-30',
      status: 'active',
    },
  },
  {
    id: 102687,
    sol: 3800,
    camera: {
      id: 21,
      name: 'NAVCAM',
      rover_id: 6,
      full_name: 'Navigation Camera',
    },
    img_src: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=800&auto=format&fit=crop&q=80',
    earth_date: '2023-04-12',
    rover: {
      id: 6,
      name: 'Curiosity',
      landing_date: '2012-08-06',
      launch_date: '2011-11-26',
      status: 'active',
    },
  }
];

export const mockNeoData = {
  element_count: 6,
  near_earth_objects: [
    {
      id: '2021201',
      name: '433 Eros (1898 DQ)',
      absolute_magnitude_h: 10.4,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 16.84,
          estimated_diameter_max: 37.66,
        },
      },
      is_potentially_hazardous_asteroid: false,
      close_approach_data: [
        {
          close_approach_date: new Date().toISOString().split('T')[0],
          miss_distance: {
            kilometers: '26781200',
          },
          relative_velocity: {
            kilometers_per_hour: '19872.4',
          },
        },
      ],
    },
    {
      id: '3542519',
      name: '(2010 PK9)',
      absolute_magnitude_h: 21.8,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 0.11,
          estimated_diameter_max: 0.26,
        },
      },
      is_potentially_hazardous_asteroid: true,
      close_approach_data: [
        {
          close_approach_date: new Date().toISOString().split('T')[0],
          miss_distance: {
            kilometers: '7429100',
          },
          relative_velocity: {
            kilometers_per_hour: '42180.1',
          },
        },
      ],
    },
    {
      id: '2099942',
      name: '99942 Apophis (2004 MN4)',
      absolute_magnitude_h: 19.7,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 0.31,
          estimated_diameter_max: 0.68,
        },
      },
      is_potentially_hazardous_asteroid: true,
      close_approach_data: [
        {
          close_approach_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          miss_distance: {
            kilometers: '3801200',
          },
          relative_velocity: {
            kilometers_per_hour: '26740.8',
          },
        },
      ],
    },
    {
      id: '2101955',
      name: '101955 Bennu (1999 RQ36)',
      absolute_magnitude_h: 20.19,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 0.44,
          estimated_diameter_max: 0.56,
        },
      },
      is_potentially_hazardous_asteroid: true,
      close_approach_data: [
        {
          close_approach_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          miss_distance: {
            kilometers: '12450800',
          },
          relative_velocity: {
            kilometers_per_hour: '22680.0',
          },
        },
      ],
    },
    {
      id: '3759353',
      name: '(2016 RB1)',
      absolute_magnitude_h: 28.3,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 0.007,
          estimated_diameter_max: 0.016,
        },
      },
      is_potentially_hazardous_asteroid: false,
      close_approach_data: [
        {
          close_approach_date: new Date().toISOString().split('T')[0],
          miss_distance: {
            kilometers: '1492000',
          },
          relative_velocity: {
            kilometers_per_hour: '29510.5',
          },
        },
      ],
    },
    {
      id: '2162173',
      name: '162173 Ryugu (1999 JU3)',
      absolute_magnitude_h: 19.2,
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: 0.85,
          estimated_diameter_max: 0.98,
        },
      },
      is_potentially_hazardous_asteroid: false,
      close_approach_data: [
        {
          close_approach_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
          miss_distance: {
            kilometers: '18940000',
          },
          relative_velocity: {
            kilometers_per_hour: '31200.0',
          },
        },
      ],
    },
  ],
  isFallback: true,
};
