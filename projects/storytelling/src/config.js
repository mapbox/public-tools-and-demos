// eslint-disable-next-line
export const config = {
  style: 'mapbox://styles/examples/cmlqpbccj000e01qk91p3hzve',
  accessToken: import.meta.env.VITE_YOUR_MAPBOX_ACCESS_TOKEN,
  showMarkers: false,
  theme: 'dark',
  alignment: 'left',
  title: 'Storytelling with Mapbox Example',
  subtitle: 'A low-code template to help you tell your map-based story',
  footer:
    'Sources: U.S. Census Bureau, American Community Survey, Max Planck Institute for Ornithology, USDA National Agricultural Statistics Service',
  chapters: [
    {
      id: 'county-circles-1',
      title: 'What does this template do?',
      image:
        'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 790 180%22%3E%3Cpath d%3D%22M89.1 1.8C39.9 1.8 0 41.7 0 90.9 0 140.1 39.9 180 89.1 180c49.2 0 89.1-39.9 89.1-89.1 0-49.2-39.9-89.1-89.1-89.1zm457.8 19.7c-1.2 0-2.2 1-2.2 2.2v103.2c0 1.2 1 2.2 2.2 2.2h13.4c1.2 0 2.2-1 2.2-2.2v-7.1c6.9 7.2 16.4 11.3 26.3 11.3 20.9 0 37.9-18 37.9-40.3 0-22.3-17-40.2-37.9-40.2-10 0-19.5 4.1-26.3 11.3V23.7c0-1.2-1-2.2-2.2-2.2h-13.4zM98.3 36.4c11.4.3 22.9 4.8 31.7 13.7 17.7 17.7 18.3 45.7 1.4 62.7-30.5 30.5-84.8 20.7-84.8 20.7s-9.8-54.3 20.7-84.8c8.5-8.4 19.7-12.5 31-12.3zm160.3 14.2c-8.2 0-15.9 4-20.8 10.6v-6.4c0-1.2-1-2.2-2.2-2.2h-13.4c-1.2 0-2.2 1-2.2 2.2V127c0 1.2 1 2.2 2.2 2.2h13.4c1.2 0 2.2-1 2.2-2.2V83.8c.5-9.7 7.2-17.3 15.4-17.3 8.5 0 15.6 7.1 15.6 16.5v44c0 1.2 1 2.2 2.2 2.2h13.5c1.2 0 2.2-1 2.2-2.2l-.1-44.9c1.2-8.8 7.6-15.6 15.3-15.6 8.5 0 15.6 7.1 15.6 16.5v44c0 1.2 1 2.2 2.2 2.2h13.5c1.2 0 2.2-1 2.2-2.2l-.1-49.6c.3-14.8-12.3-26.8-27.9-26.8-10 .1-19.2 5.9-23.5 15-5-9.3-14.7-15.1-25.3-15zm127.9 0c-20.9 0-37.9 18-37.9 40.3 0 22.3 17 40.3 37.9 40.3 10 0 19.5-4.1 26.3-11.3v7.1c0 1.2 1 2.2 2.2 2.2h13.4c1.2 0 2.2-1 2.2-2.2V54.8c.1-1.2-.9-2.2-2.2-2.2H415c-1.2 0-2.2 1-2.2 2.2v7.1c-6.9-7.2-16.4-11.3-26.3-11.3zm106.1 0c-10 0-19.5 4.1-26.3 11.3v-7.1c0-1.2-1-2.2-2.2-2.2h-13.4c-1.2 0-2.2 1-2.2 2.2V158c0 1.2 1 2.2 2.2 2.2h13.4c1.2 0 2.2-1 2.2-2.2v-38.2c6.9 7.2 16.4 11.3 26.3 11.3 20.9 0 37.9-18 37.9-40.3 0-22.3-17-40.2-37.9-40.2zm185.5 0c-22.7 0-41 18-41 40.3 0 22.3 18.4 40.3 41 40.3s41-18 41-40.3c0-22.3-18.3-40.3-41-40.3zm45.4 2c-1.1 0-2 .9-2 2 0 .4.1.8.3 1.1l23 35-23.3 35.4c-.6.9-.4 2.2.6 2.8.3.2.7.3 1.1.3h15.5c1.2 0 2.3-.6 2.9-1.6l13.8-23.1 13.8 23.1c.6 1 1.7 1.6 2.9 1.6h15.5c1.1 0 2-.9 2-2 0-.4-.1-.7-.3-1.1L766 90.7l23-35c.6-.9.4-2.2-.6-2.8-.3-.2-.7-.3-1.1-.3h-15.5c-1.2 0-2.3.6-2.9 1.6l-13.5 22.7-13.5-22.7c-.6-1-1.7-1.6-2.9-1.6h-15.5zM99.3 54l-8.7 18-17.9 8.7 17.9 8.7 8.7 18 8.8-18 17.9-8.7-17.9-8.7-8.8-18zm290.3 12.7c12.7 0 23 10.7 23.2 23.9v.6c-.1 13.2-10.5 23.9-23.2 23.9-12.8 0-23.2-10.8-23.2-24.2 0-13.4 10.4-24.2 23.2-24.2zm99.8 0c12.8 0 23.2 10.8 23.2 24.2 0 13.4-10.4 24.2-23.2 24.2-12.7 0-23-10.7-23.2-23.9v-.6c.2-13.2 10.5-23.9 23.2-23.9zm96.3 0c12.8 0 23.2 10.8 23.2 24.2 0 13.4-10.4 24.2-23.2 24.2-12.7 0-23-10.7-23.2-23.9v-.6c.2-13.2 10.5-23.9 23.2-23.9zm92.2 0c12.8 0 23.2 10.8 23.2 24.2 0 13.4-10.4 24.2-23.2 24.2-12.8 0-23.2-10.8-23.2-24.2 0-13.4 10.4-24.2 23.2-24.2z%22 fill%3D%22%23FFF%22%2F%3E%3C%2Fsvg%3E',
      description:
        'An approach to interactive storytelling, where the graphics appear on a map as the user scrolls through the story. This site template was designed and built to accelerate the process of creating a map-based scrolling story.',
      location: {
        center: [-97.061, 38.39659],
        zoom: 3.3,
        pitch: 0.0,
        bearing: 0.0
      },
      onChapterEnter: [
        // {
        //   layer: "county-pop-centroid",
        //   opacity: 0.5
        // }
      ],
      onChapterExit: [
        // {
        //   layer: "county-pop-centroid",
        //   opacity: 0
        // }
      ]
    },
    {
      id: 'county-circles-2',
      title: 'Control the map',
      image: '',
      description:
        'Zoom, pan, tilt, and rotate the map to higlight the geographic area related to this part of your story.',
      location: {
        center: [-80.70604, 36.22582],
        zoom: 5.7,
        pitch: 60.0,
        bearing: 0.0
      },
      onChapterEnter: [
        {
          layer: 'county-pop-centroid',
          opacity: 0.5
        }
      ],
      onChapterExit: [
        {
          layer: 'county-pop-centroid',
          opacity: 0
        }
      ]
    },
    {
      id: 'county-polys-1',
      title: 'Change the layers',
      image: '',
      description:
        'If you have set up custom map data in Mapbox Studio, there are also settings to control which map layers to show and hide.',
      location: {
        center: [-80.70604, 36.22582],
        zoom: 5.7,
        pitch: 60.0,
        bearing: 0.0
      },
      onChapterEnter: [
        {
          layer: 'county-pop-polygon',
          opacity: 0.5
        }
      ],
      onChapterExit: [
        {
          layer: 'county-pop-polygon',
          opacity: 0
        }
      ]
    },
    {
      id: 'freedom-1',
      title: 'Layer support',
      image: '',
      description:
        'This template supports circle, line, fill, symbol, fill-extrusion, and raster layers.',
      location: {
        center: [-81.38123, 35.85894],
        zoom: 7.51,
        pitch: 60.0,
        bearing: 38.4
      },
      onChapterEnter: [
        {
          layer: 'freedom-line',
          opacity: 0.3
        }
      ],
      onChapterExit: [
        {
          layer: 'freedom-line',
          opacity: 0
        }
      ]
    },
    {
      id: 'raster-1',
      title: 'Your data and Mapbox data',
      image: '',
      description:
        'You can control any data in your Studio style, including base map layers. Shown in green are national park areas.',
      location: {
        center: [-107.061, 38.39659],
        zoom: 7,
        pitch: 60.0,
        bearing: 0
      },
      onChapterEnter: [
        {
          layer: 'national-park',
          opacity: 0.5
        }
      ],
      onChapterExit: [
        {
          layer: 'national-park',
          opacity: 0
        }
      ]
    },
    {
      id: 'raster-2',
      title: "Guide your reader's eye",
      image: '',
      description:
        'We also built a page to help find location coordinates and set up the best "camera angle" to showcase a location. Find the helper at <a href=\'https://demos.mapbox.com/location-helper/\'>https://demos.mapbox.com/location-helper/</a>.',
      location: {
        center: [-119.55048, 36.03344],
        zoom: 11.1,
        pitch: 55.5,
        bearing: -115.2
      },
      onChapterEnter: [
        {
          layer: 'cdl-2018',
          opacity: 0.5
        }
      ],
      onChapterExit: [
        {
          layer: 'cdl-2018',
          opacity: 0
        }
      ]
    },
    {
      id: 'wrap-up',
      title: '',
      image: '',
      description:
        "The hard part still may be coming up with a story, but now it's a little easier to tell. Built with Mapbox GL JS, Scrollama.js, and JavaScript. Clone the template and find documentation at <a href='https://github.com/mapbox/storytelling/'>https://github.com/mapbox/storytelling</a>",
      location: {
        center: [-97.061, 38.39659],
        zoom: 3.3,
        pitch: 0.0,
        bearing: 0.0
      },
      onChapterEnter: [
        {
          layer: 'county-pop-centroid',
          opacity: 0.5
        }
      ],
      onChapterExit: [
        {
          layer: 'county-pop-centroid',
          opacity: 0
        }
      ]
    }
  ]
}
