# Data Platform Frontend

This project uses [VueJS 3](https://vuejs.org/) with [Vite](https://vitejs.dev/) and [TailwindCSS](https://tailwindcss.com/).
For form validation [Vuelidate](https://vuelidate-next.netlify.app/) is used.

State management is done via [Pinia](https://pinia.vuejs.org/).

## Project setup

    npm install

### Before startup
You need to either have a local backend running and or use a cloud deployed backend.

Setup a .env file with following variables, e.g.:

    VITE_ROOT_API=http://localhost:3000

VITE_ROOT_API is the URL for the backend API, either on localhost or in the cloud.
### Compiles and hot-reloads for development

    npm run dev


## Production Build and Deployment (Sprint 2 - D2)

### Environment Setup

The frontend uses the `VITE_ROOT_API` environment variable to connect to the backend API.

A `.env` file is included in the frontend folder:

```env
VITE_ROOT_API=http://localhost:3000
```

The backend must be running on port 3000 for API requests to work locally.

### Build Instructions

From the frontend directory, run:

```bash
npm install
npm run build
```

The production build is generated in the `frontend/dist` directory.

### Testing the Production Build

Run:

```bash
npm run serve
```

Open `http://localhost:4173` in a browser.

The production build was successfully generated using Vite 3.2.11, with 118 modules transformed. The dashboard and application layout were verified to display in the browser.

Backend-connected workflows still need to be tested with the backend and database running.

### SPA Fallback

The application uses Vue Router with HTML5 history mode. Static hosting services must be configured to serve `index.html` when a frontend route does not match a physical file.

This allows users to refresh nested routes such as `/clientdetails/:id` without receiving a 404 error.

- `public/_redirects` (`/* /index.html 200`) is copied into `dist/` by the build and handles this on Netlify / Cloudflare Pages.
- Vercel: add a rewrite from `/(.*)` to `/index.html`.
- nginx: `try_files $uri /index.html;`
- `npm run serve` (vite preview) already does this fallback locally.

### Deployment Notes

Before deploying:

- Set `VITE_ROOT_API` to the deployed backend URL.
- Rebuild the frontend after changing environment variables.
- Configure the backend CORS origin to allow the frontend's deployed URL.
- Configure SPA fallback on the static hosting provider.
- Serve the generated `dist` directory.

### Known Limitations

The production frontend build has been verified locally. Backend integration, login, database-connected dashboard data, and nested-route refresh behavior still require verification.