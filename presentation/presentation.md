# Hands-on JavaScript

#### &nbsp;

### LINCS Python(-ish) Workshop

### Wednesday, January 25, 2023

#### &nbsp;

#### Rémi Varloot — Nokia Bell Labs

#### &nbsp;

```text
git clone https://github.com/rvarloot/lincs-js-todo.git
cd lincs-js-todo
npm install
npm start           # Run the to-do application (port 8000)
npm run doc         # Serve the slides (port 8080)
```

---

## The project: a to-do list

--

### Project contents

This project comprises:

- A front-end:
  
  <iframe height="300" width="400" src="http://127.0.0.1:8000/" style="transform-origin: -100px 50px; transform: scale(1.5);"></iframe>

- A NodeJS back-end that serves the page and hosts the data.

--

### Project structure

```text
to-do/
├── node_modules/       ╮       ╮
├── package.json        | NPM   |
├── package-lock.json   ╯       | Back-end
│                               |
├── server.js                   |
├── data.js                     ╯
│
├── public/             ╮    
│   ├── index.html      | Front-end
│   └── client.js       ╯    
│
└── presentation/
```

--

## Back-end API

<table>
    <tr><td><code>GET /data</code></td><td>list items</td></tr>
    <tr><td><code>POST /data</code></td><td>create an item</td></tr>
    <tr><td><code>PUT /data/:id</code></td><td>update an item</td></tr>
    <tr><td><code>DELETE /data/:id</code></td><td>remove an item</td></tr>
    <tr><td><code>POST /cleanup</code></td><td>remove all completed items</td></tr>
</table>

---

## First, the back-end/server

--

### Creating a NodeJS project

Create a `package.json` file with the following content:

```json
{
    "name": "lincs-js-todo",
    "type": "module",                           // To use ECMAScript imports
    "scripts": {
        "start": "node server.js",              // Run with `npm run start` or simply `npm start`
        "doc": "http-server ./presentation/"    // Serve documentation with `npm run doc`
    },
    "dependencies": {
        "express": "^4.18.2",
        "http-server": "^14.1.1"
    }
}
```

> You can generate a default `package.json` file by running `npm init -y`.

--

Install dependencies in the `node_modules` folder by running `npm install`, or `npm i` for short.

> You can run `npm install express` to install `express` to `node_modules` and add it to the dependencies in `package.json`.

This also creates `package-lock.js`, which freezes the package versions. If present when running `npm i`, the package versions in that file are used.

--

### Defining the data structure

We first define a data structure to hold our data in `data.js`:

```js
export class Data {
    #data = new Map()       //  #data: Map<string, { id: string, name: string, done: boolean }>
    constructor(...initialData) { /* ... */ }

    has(id) { /* ... */ }
    add(name) { /* ... */ }
    get(id) { /* ... */ }
    getAll() { /* ... */ }
    update(id, done) { /* ... */ }
    remove(id) { /* ... */ }
    cleanup() { /* ... */ }
}
```

- Use `export` to make items available to scripts that import `data.js`
- Private attributes begin with `#`
- Use `Map`s for homogeneous collections, and `Object`s for structured data

--

```js
constructor(...initialData) {
    initialData.forEach(datum => this.add(datum))
}
```

- `constructor(...args)` &harr; `def __init__(self, *args)`
- `this` &harr; `self`
- Functional programming instead of comprehensions
- Arrow functions: somewhere between lambdas and regular functions
  - No `this` binding (this wouldn't work with a normal function)
  - No curly braces required for single statements (be careful when returning objects though: `x => ({a: x})`)

--

A quick aside on iterating...

```js
const array = [1, 2, 3]                     // or `new Array(1, 2, 3)`
for (let i = 0; i < array.length; ++i ) {}  // old-school
for (let i in array) {}                     // indices
for (let v of array) {}                     // values
array.forEach((v, i, a) => {})              // value, index, array
// Also:
//  array.map       array.filter    array.reduce    array.includes  array.some      array.every
// and iterators:
//  array.keys      array.values    array.entries

const object = { a: 1, b: 2, c: 3 }
for (let k in object) {}                    // keys, with some edge-cases
Object.keys(object)                         // key[]
Object.values(object)                       // value[]
Object.entries(object)                      // [key, value][]

const map = new Map([['a', 1], ['b', 2], ['c', 3]])
for (let [k, v] of map) {}                  // [key, value] pairs
map.forEach((v, k, m) => {})                // value, key, index
// No map/filter/etc, only forEach, keys, values and entries !
// `Set` data structure has the same methods (it's basically a key->key Map)
```

--

```js
has(id) {
    return this.#data.has(id)
}

get(id) {
    return this.#data.get(id)
}

getAll() {
    return [...this.#data.values()]
}
```

The `get` method returns `undefined` if the key is not found.

The spread operation is used to transform the iterator returned by `values()` into an `Array`.

> JavaScript has both `undefined` and `null` types; the former is (generally) used for non-existent data, the latter for intentionally placed void data.

--

```js
import { randomUUID as uuid } from 'crypto'

export class Data {
    /* ... */

    add(name) {
        console.log(`Adding ${name}`)
        const id = uuid()
        this.#data.set(id, { id, name, done: false })
        return id
    }
}
```
- `import`s use object destructuring
- Template literals: `` `Template ${'string'}` `` (think Python f-strings)
- Use `const` to declare variables, or `let` if you need to reassign them
- Object creation shorthand: `{ a }` &harr; `{ a: a }`

--

```js
update(id, done) {
    console.log(`Updating ${id}`)
    
    if (this.has(id)) {
        this.#data.get(id).done = done
        return true
    }

    return false
}

remove(id) {
    console.log(`Removing ${id}`)
    return this.#data.delete(id)
}
```

--

```js
cleanup() {
    console.log('Cleaning up')
    ;[...this.#data.entries()]
        .filter(([k, v]) => v.done)
        .forEach(([k,v]) => this.remove(k))
}
```

> The semi-colon is required here! Consider the following example:
> 
> ```js
> const a = b
> [c].forEach(f)
> ```
> 
> JavaScript thinks the second line is a continuation of the previous one:
> 
> ```js
> const a = b[c].forEach(f)
> ```
> 
> The semi-colon clarifies this ambiguity.
>
> (And yes, it's common practice to place it at the beginning of the offending line, to avoid forgetting it in case you move lines around...)

--

### Creating the server

Let's create `server.js`, our back-end entrypoint.

```js
const PORT = process.env.PORT || 8000           // Standard method for using environment variables

import { Data } from './data.js'                // Our data structure
const data = new Data('Item 1', 'Task 2')       // const does not mean immutable!

import express from 'express'
const app = express()

app.use(express.static('public'))               // index.html and client.js

app.get('/data', (req, res) => { /* ... */ })
app.post('/data', (req, res) => { /* ... */ })
app.put('/data/:id', (req, res) => { /* ... */ })
app.delete('/data/:id', (req, res) => { /* ... */ })
app.post('cleanup', (req, res) => { /* ... */ })

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
```

> Most libraries export functions or constructors rather than variables or instances, to guarantee you always have a "fresh" copy

--

```js
app.use(express.text())

/* ... */

app.get('/data', (req, res) => {
    res.send(data.getAll())
})

app.post('/data', (req, res) => {
    const value = req.body
    const id = data.add(value)
    res.status(201).send(id)
})
```

> Middleware are a common design pattern in JavaScript, e.g.
> 
> ```js
> app.use((req, res, next) => {
>     console.log(`${req.method} ${req.url}`)
>     next()
> })
> ```

--

```js
app.use(express.json())

app.put('/data/:id', (req, res) => {
    const id = req.params.id
    if (data.has(id)) {
        data.update(id, req.body.done)  // req.body: { done: boolean }
        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
})

app.delete('/data/:id', (req, res) => {
    const { id } = req.params                   // Another way of retrieving id
    res.sendStatus(data.remove(id) ? 204 : 404) // Love it or hate it...
})

app.post('/cleanup', (req, res) => {
    data.cleanup()
    res.sendStatus(204)
})
```

We could also have destructured `req` directly:

```js
app.put('/data/:id', ({ params: { id }, body: { done }}, res) => {
```

---

## And now the front-end/client

--

### The HTML

`index.html` is quite straightforwards:

```html
<!DOCTYPE html>
<html>
<head>
    <title>To-Do List</title>
    <script defer src="client.js"></script>
</head>
<body>
    <h1>To-Do List</h1>

    <ul id="list"></ul>

    <p>
        <input type="text" name="new-name" id="new-name">
        <button onclick="add()">Add</button>
    </p>
    
    <p>
        <button onclick="cleanup()">Clear finished</button>
    </p>
</body>
</html>
```

`defer` tells the browser to only run the script once the page is fully loaded

--

Our populated list will look like this:

```html
<ul id="list">
    <li data-id="item-1-id">
        <input type="checkbox" id="item-1-id">
        <label for="item-1-id">Item 1</label>
        <a href="#">🗑</a>
    </li>
    <li data-id="task-2-id">
        <input type="checkbox" id="task-2-id">
        <label for="task-2-id">Task 2</label>
        <a href="#">🗑</a>
    </li>
</ul>
```

--

### The JavaScript

And finally, `client.js`:

```js
const listContainer = document.getElementById('list')
const newNameField = document.getElementById('new-name')

function render(data) { /* ... */ }
function refresh() { /* ... */ }

function add() { /* ... */ }
function onChange(event) { /* ... */ }
function remove(id) { /* ... */ }
function cleanup() { /* ... */ }

refresh()
setInterval(refresh, 1000)
```

--

```js
function render(data) {
    const listElements = data.map(({id, name, done}) => {
        const li = document.createElement('li')
        li.dataset.id = id

        const input = document.createElement('input')
        input.type = 'checkbox'
        input.id = id
        input.checked = done
        input.onchange = onChange
        li.appendChild(input)
        
        const label = document.createElement('label')
        label.htmlFor = id
        label.innerText = name
        li.appendChild(label)
        
        const rmLink = document.createElement('a')
        rmLink.href = '#'
        rmLink.innerText = '🗑'
        rmLink.onclick = () => remove(id)           // Properly scoped
        li.appendChild(rmLink)
        
        return li
    })

    listContainer.replaceChildren(...listElements)
}
```

--

Yes, we could also have written

```js
function render(data) {
    listContainer.innerHTML = data.map(({id, name, done}) => `
    <li data-id="${id}">
        <input type="checkbox" id="${id}" ${done ? 'checked' : ''} onchange="onChange()">
        <label for="${id}">${name}</label>
        <a href="#" onclick="remove(${id})">🗑</a>
    </li>
    `).join()
}
```

but it's slower as the browser must parse the string

> To have the best of both worlds, use preprocessors to pre-compile templates into JavaScript code!

--

```js
async function refresh() {
    try {
        const res = await fetch('/data')
        
        if (!res.ok) throw new Error(`fetch error code ${res.status}`)
        
        const data =  await res.json()
        const values = Object.values(data)
        render(values)
    } catch (err) {
        console.error(err)
    }
}
```

`async` functions return `Promise`s. This is equivalent to:

```js
function refresh() {
    return fetch('/data')
        .then(res => {
            if (!res.ok) throw new Error(`fetch error code ${res.status}`)
            return res
        })
        .then(res => res.json())
        .then(data => Object.values(data))
        .then(render)
        .catch(console.error)
}
```

--

```js
async function add() {
    const name = newNameField.value

    try {
        const res = await fetch('/data', {
            method: 'POST',
            body: name,
            headers: { "Content-Type": "text/plain" },
        })

        if (!res.ok) throw new Error(`fetch error code ${res.status}`)

        refresh()
        newNameField.value = ''
    } catch (err) {
        console.error(err)
    }
}
```

Notice the comma at the end of the `headers` line: it's optional, but avoids introducing errors when moving lines around!

--

```js
async function onChange(event) {
    const { id, checked } = event.currentTarget

    try {
        const res = await fetch(`/data/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                done: checked,
            }),
            headers: { "Content-Type": "application/json" },
        })

        if (!res.ok) throw new Error(`fetch error code ${res.status}`)

        refresh()
    } catch (err) {
        console.error(err)
    }
}
```

`JSON.stringify` to serialize, `JSON.parse` to deserialize

--

```js
async function remove(id) {
    try {
        const res = await fetch(`/data/${id}`, {
            method: 'DELETE',
        })
        
        if (!res.ok) throw new Error(`fetch error code ${res.status}`)

        refresh()
    } catch (err) {
        console.error(err)
    }
}

async function cleanup() {
    try {
        const res = await fetch(`/cleanup`, {
            method: 'POST',
        })
        
        if (!res.ok) throw new Error(`fetch error code ${res.status}`)
        
        refresh()
    } catch (err) {
        console.error(err)
    }
}
```

--

Bonus: do not pollute the global namespace!

```js
const { add, onChange, remove, cleanup } = function() {
    const listContainer = document.getElementById('list')
    const newNameField = document.getElementById('new-name')
    
    function render(data) { /* ... */ }
    function refresh() { /* ... */ }
    
    function add() { /* ... */ }
    function onChange(event) { /* ... */ }
    function remove(id) { /* ... */ }
    function cleanup() { /* ... */ }
    
    setInterval(refresh, 1000)

    return { add, onChange, remove, cleanup }
}()
```

Immediately Invoked Function Expressions (IIFE) are the standard means of scoping variables when not using modules.

--

Two more options to preserve the global namespace:

- Bind click events programmatically
  ```js
  ;(function() {
      /* ... */
  
      document.getElementById('add-button').onclick = add
      document.getElementById('cleanup-button').onclick = cleanup
  
      /* ... */
  })()
  ```

  > The parenthesis are required for obscure reasons (namely, to specify that this is a "function expression", therefore callable)

- Load the script as a module
  ```html
  <script defer type="module" src="client.js"></script>
  ```

---

## We're done!

<iframe height="300" width="400" src="http://127.0.0.1:8000/" style="transform-origin: -100px 50px; transform: scale(1.5);"></iframe>

--

### What could we improve upon?

- Replace polling with long polling or WebSockets
- Only update the parts of the DOM that change (Virtual DOM)
- Store data in a database

--

### What did I not cover ?

- JavaScript-specific operators:
  - the difference between `==` and `===` (always use `===` and `!==`)
  - optional chaining (`?.`), e.g. `const a = map.get(key)?.value`
- Iterators and Generators, Scopes and Closures, Symbols, Streams
- JavaScript's prototype-based inheritance
- Web Workers, Service Workers and Worklets, Client-side storage

--

### The worst of JavaScript

```js
[] == ![]   // -> true

NaN === NaN // -> false

null == 0   // -> false
null > 0    // -> false
null >= 0   // -> true

[10, 1, 3].sort() // -> [1, 10, 3]
```

--

## Thank you!
