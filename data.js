import { randomUUID as uuid } from 'crypto'

export class Data {
    #data = new Map()
    
    constructor(...initialData) {
        initialData.forEach(datum => this.add(datum))
    }

    has(id) {
        return this.#data.has(id)
    }
    
    add(name) {
        console.log(`Adding ${name}`)
        const id = uuid()
        this.#data.set(id, { id, name, done: false })
        return id
    }
    
    get(id) {
        return this.#data.get(id)
    }

    getAll() {
        return [...this.#data.values()]
    }

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

    cleanup() {
        console.log('Cleaning up')
        ;[...this.#data.entries()]
            .filter(([k, v]) => v.done)
            .forEach(([k,v]) => this.remove(k))
    }
}