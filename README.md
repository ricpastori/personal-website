# Personal Website

Source code for [ricpastori.com](https://ricpastori.com)￼, my personal portfolio and blog.

The website is built with Hugo and uses a custom front-end structure based on Go templates, plain CSS, JavaScript, and Markdown content. It does not use Tailwind, Bootstrap, React, or any framework.

## Overview

The site is designed to present:

* Selected projects and case studies
* UX and product design work
* Front-end experiments
* Notes, writing, and visual explorations

The project follows a lightweight static-site approach, with attention to:

* Performance
* Accessibility
* Responsive layouts
* Content structure
* SEO
* Small, focused interactions

## Tech Stack

* Hugo
* Go Templates
* HTML
* CSS
* JavaScript
* Markdown

A small Node script is used to generate draft project data, but the website is not managed through an npm-based build pipeline.

## Project Structure

.
├── archetypes/   # Hugo content archetypes
├── assets/       # CSS, JavaScript, images, icons, and generated assets
├── content/      # Markdown content and project pages
├── layouts/      # Hugo templates and partials
├── scripts/      # Utility scripts
├── static/       # Static files served as-is
├── hugo.toml     # Hugo configuration
└── Makefile      # Development and build commands

## Development

Start the local development server without draft pages:

`make dev`

Start the local development server including drafts:

`make dev-drafts`

Build the production site:

`make build`

Clean generated files:

`make clean`

You can also run Hugo directly:

`
hugo server
hugo
`

## Deployment

The website is deployed on Cloudflare Pages.

## Live Website

[ricpastori.com](https://ricpastori.com)

## License

The source code of this project is available for reference and learning purposes.

You are free to explore, study, and adapt parts of the implementation for personal or educational use.

All written content, case studies, branding, and visual assets remain © Riccardo Pastori unless otherwise stated.

Please do not copy or redistribute the website content, design, or projects as your own.
