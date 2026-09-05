astro is like jsx without the annoying parts
- front matter is turned into only html
- <script> ships to client
- front-matter executes only on build
client:load (loads js)
cluient:visible (untill on screen)

- /public/ is base level from the server

- YOU CAN NEST LAYOUTS
- you need to slugify (run through slugify function you find online) links generated from frontmatter 


### decap cms
  - ?: json : all in one || each product it's own json
  - media and public
    - media : don't use public path and starts from root /src/public/uploads/file.png
    - pulic : actual src value /uploads/file.png (cause public serces uploads at root)
  - always have a [label] string field
