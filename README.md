# Q99FM Poll Tracker

Live vote tracker for the Q99FM poll, built with Next.js + Recharts. Deployed at https://radio-station-checker.vercel.app

## How it works

A GitHub Action polls the Q99FM API every minute and appends a row to `data/votes.csv`. The Vercel page fetches the CSV and renders two charts: cumulative vote totals and per-minute rate.

## Required setup: GitHub Actions write permission

The action commits CSV data back to the repo. GitHub's default token is read-only, so you must enable write access once:

1. Go to **Settings → Actions → General** in this repo
2. Under **Workflow permissions**, select **Read and write permissions**
3. Click **Save**

Without this, the action will run but fail silently on the commit step.

## Manual trigger

You can trigger the action immediately (without waiting for the 5-minute cron) at:
**Actions → Poll Votes → Run workflow**
