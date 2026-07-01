# Engagement Frame Player

A minimal Next.js app that renders 72 sequential JPG frames on an HTML5 canvas at 24 FPS.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL printed by Next.js, usually:

```text
http://localhost:3000
```

## Frame Assets

The animation uses images from:

```text
public/engagement-frames/frame_0001.jpg
...
public/engagement-frames/frame_0072.jpg
```

At runtime these are served from:

```text
/engagement-frames/frame_0001.jpg
```
