## Deployment

In the interest of moving quickly, sites included in this collection bypass the normal Mapbox publisher infrastructure.  Instead, builds and deployment are triggered manually in the development environment.  

After authenticating, run `node scripts/deploy-project.js [site id] [environment]`.  e.g. `node scripts/deploy-project.js location-helper production` will build and deploy the `location-helper` project.

**Note** Do not publish with a personal access token. Use the common `public-demos-and-tools` access token used by the documentation team in `.env` before publishing.
