## Pretty error pages for production

Author: PK, 28 Jan 2020.

---

### Purpose

Specifically relating to content being drawn from the backend (i.e. Drupal) we
need to prevent any Drupal error messages being displayed for missing content.
This is particularly important for image styles, which are proxied through
images.liverpool to the backend content.liverpool. In this situation, the
default Drupal error page (for an unknown image) would present CSS and markup
from Drupal, which cannot load (and gives away potential information about the
backend).

The solution is to set up static error page for NGINX errors.

### Local setup

To install the SCSS/SASS compiler into node_modules: `npm install`

Then:
- to build: `npm run build`
- to watch (for local development): `npm run watch`

Where possible, the SCSS calls variables and mixins from the main frontend
project's /scss directory, keeping this as a very light project.

### NGINX installation

In the images.liverpool NGINX config, add the following:
```
    ##
    # Handle error pages by presenting a custom error page. We don't want to
    # display Drupal 404 pages.
    # Define error page:
    error_page 400 402 405 406 407 408 409 410 411 412 413 414 415 416 417 418 421 422 423 424 425 426 428 429 431 451 /40x.html;
    error_page 401 /401.html;
    error_page 403 /403.html;
    error_page 404 /404.html;
    error_page 500 501 502 503 504 505 506 507 508 510 511 /50x.html;

    location ~ /(40x|401|403|404|50x)\.html$ {
      root /path/to/repo/national-museums-liverpool-bbd.git/frontend/errors/;
    }
```

Also important is to allow NGINX to catch the Drupal errors and rewrite its
error page to an NGINX-provided one:
```
    proxy_intercept_errors on;
    # or
    fastcgi_intercept_errors on;
```

Note, the files must be installed on both the frontend and backend servers: the
backend requires the HTML files and the frontend servers provide the CSS/images.

### EDIT:
SCSS has also been extended to create an XSL stylesheet. This is generated into
css and then copied into /static/sitemap/xmlsitemap.xsl.css by the production
build scripts. See sitemap.xml on the live site for implementation.
