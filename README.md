# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deploying to Netlify

To deploy this Next.js application to Netlify, follow these steps:

1.  **Connect your Git Repository to Netlify:**
    *   Push your project to a GitHub, GitLab, or Bitbucket repository.
    *   In your Netlify dashboard, click "Add new site" > "Import an existing project".
    *   Connect to your Git provider and select your repository.

2.  **Build Settings:**
    *   Netlify should automatically detect that this is a Next.js project.
    *   The build command is `npm run build` (or `next build`).
    *   The publish directory is `.next`.
    *   The `netlify.toml` file in this repository provides these basic settings.

3.  **Environment Variables:**
    You MUST configure the following environment variables in your Netlify site's settings:
    *   Go to your Site settings > Build & deploy > Environment.
    *   Add the following variables:
        *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project Anon key.
        *   `IMGUR_CLIENT_ID`: Your Imgur application Client ID (if you are using the jmdy.shop to Imgur image conversion feature).

4.  **Deploy:**
    *   Click "Deploy site". Netlify will build and deploy your application.

**Note on `apphosting.yaml`:**
The `apphosting.yaml` file in this project is specific to Firebase App Hosting and is not used by Netlify.

## Local Development

To run the project locally:

1.  Ensure you have Node.js (preferably a recent LTS version) and npm installed.
2.  Create a `.env` file in the root of the project and add your Supabase and (optional) Imgur credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL_HERE"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY_HERE"
    IMGUR_CLIENT_ID="YOUR_IMGUR_CLIENT_ID_HERE" # Optional
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

5.  If you are using Genkit AI features, you might also want to run the Genkit development server in a separate terminal:
    ```bash
    npm run genkit:dev
    ```
    Or with watching for changes:
    ```bash
    npm run genkit:watch
    ```
