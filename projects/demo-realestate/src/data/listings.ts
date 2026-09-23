import bedroom from '../img/listings/bedroom.jpg'
import desertHouse from '../img/listings/desert-house.jpg'
import duskHouse from '../img/listings/dusk-house.jpg'
import kitchen from '../img/listings/kitchen.jpg'
import livingRoom from '../img/listings/living-room.jpg'
import poolHouse from '../img/listings/pool-house.jpg'
import type { Listing } from '../types/listing'

/** Fictional listings placed on real White Plains, NY streets, as designed. */
export const listings: Listing[] = [
  {
    id: 'overlook-214',
    name: 'Oceanview Villa',
    price: 625000,
    beds: 5,
    baths: 3,
    area: 3120,
    address: '214 Overlook Rd',
    neighborhood: 'Gedney Farms',
    type: 'house',
    tag: 'new',
    coordinates: [-73.7745, 41.0165],
    images: [kitchen, livingRoom, bedroom, desertHouse]
  },
  {
    id: 'fisher-hill-12',
    name: 'Fisher Hill Residence',
    price: 329000,
    beds: 3,
    baths: 2,
    area: 1540,
    address: '12 Fisher Hill Rd',
    neighborhood: 'Gedney Farms',
    type: 'condo',
    coordinates: [-73.769, 41.021],
    images: [livingRoom, kitchen, bedroom]
  },
  {
    id: 'ridgeway-58',
    name: 'Ridgeway Modern',
    price: 1100000,
    beds: 6,
    baths: 4,
    area: 4380,
    address: '58 Ridgeway',
    neighborhood: 'Gedney Farms',
    type: 'house',
    tag: 'price-drop',
    coordinates: [-73.7712, 41.0192],
    images: [duskHouse, livingRoom, kitchen]
  },
  {
    id: 'old-orchard-9',
    name: 'Old Orchard Flat',
    price: 214000,
    beds: 2,
    baths: 1,
    area: 980,
    address: '9 Old Orchard Rd',
    neighborhood: 'Gedney Farms',
    type: 'condo',
    coordinates: [-73.7768, 41.0148],
    images: [bedroom, livingRoom]
  },
  {
    id: 'renaissance-1',
    name: 'Renaissance Penthouse',
    price: 2050000,
    beds: 6,
    baths: 5,
    area: 5600,
    address: '1 Renaissance Sq',
    neighborhood: 'Downtown White Plains',
    type: 'house',
    tag: 'featured',
    coordinates: [-73.7638, 41.0332],
    images: [poolHouse, livingRoom, kitchen, desertHouse]
  },
  {
    id: 'mamaroneck-45',
    name: 'Mamaroneck Townhouse',
    price: 685000,
    beds: 4,
    baths: 3,
    area: 2600,
    address: '45 Mamaroneck Ave',
    neighborhood: 'Downtown White Plains',
    type: 'townhouse',
    coordinates: [-73.7621, 41.0297],
    images: [bedroom, kitchen, livingRoom]
  }
]
