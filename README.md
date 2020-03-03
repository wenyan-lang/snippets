# 文言片語 - Snippets Site for wenyan-lang

http://snippets.wy-lang.org/


## API

The base api url is https://wys.glitch.me

#### `GET /pages/:page`

Get snippets by pages

#### `GET /snippets/:id`

Get data of a single snippet.

#### `GET /snippets/:id/vote/{up,down,reset}`

To vote a snippet, you can only do that once per ip address. 

- `/snippet/:id/vote/up`
- `/snippet/:id/vote/reset`
- `/snippet/:id/vote/down`

#### `GET /snippets/:id/raw`

Get raw code of a single snippet. It can be imported by [Browser Runtime]()

### Snippet Data

| Field | Example Value | Description | 
| --- | --- | --- |
| id | `13` | Snippet ID |
| title | `問天地好在` | Snippet title |
| author | `LingDong-` | Author name of the snippet |
| code | `吾有一言。曰「「問天地好在」」。書之。` | The wenyan code |
| votes | `66` | Current vote counts |
| voted | `1` | Voted value by yourself, 1 for upvote, -1 for downvote, undefined for unvoted |
