/**
 * Authoritative KIET Campus Locations Dataset
 *
 * Used across the Lost & Found application for standardized location reporting and filtering.
 *
 * Rules:
 * - NO "G Block" (does not exist at KIET)
 * - NO "Seminar Hall" (forbidden per project guidelines)
 * - H Block represents both CSE AI and CSE AI & ML
 */

export const OTHER_LOCATION_OPTION = 'Other Campus Location';
export const UNKNOWN_LOCATION_OPTION = 'Unknown / Not Sure';

export const KIET_LOCATION_GROUPS = [
  {
    group: 'Academic / Blocks',
    locations: [
      'A Block — Administrative',
      'B Block — ECE',
      'C Block — Mechanical',
      'D Block — Electrical',
      'E Block — IT',
      'F Block — Pharmacy',
      'H Block — CSE AI + CSE AI & ML'
    ]
  },
  {
    group: 'Library',
    locations: ['Central Library / KRC']
  },
  {
    group: 'Food & Refreshments',
    locations: [
      'Green Chilli',
      'Nescafe',
      'Healthy Hut',
      'Big Treat',
      'Hungry Nites'
    ]
  },
  {
    group: 'Sports & Fitness',
    locations: [
      'Sports Ground / Complex',
      'Gymnasium'
    ]
  },
  {
    group: 'Residential',
    locations: [
      'Boys Hostel',
      'Girls Hostel'
    ]
  },
  {
    group: 'Other Campus Areas',
    locations: [
      'Main Gate',
      'Parking Area',
      'Workshop',
      'Auditorium',
      'Medical Centre'
    ]
  }
];

export const KIET_LOCATIONS_FLAT = KIET_LOCATION_GROUPS.flatMap((g) => g.locations);
