import { Data } from './data.js'
import express from 'express'

const PORT = process.env.PORT || 8000

const data = new Data('Item 1', 'Task 2')

const app = express()
app.use(express.static('public'))
app.use(express.json())
app.use(express.text())

app.get('/data', (req, res) => {
    res.send(data.getAll())
})

app.post('/data', (req, res) => {
    const value = req.body
    const id = data.add(value)
    res.status(201).send(id)
})

app.put('/data/:id', (req, res) => {
    const id = req.params.id
    if (data.has(id)) {
        data.update(id, req.body.done)
        res.sendStatus(200)
    } else {
        res.sendStatus(404)
    }
})

app.delete('/data/:id', (req, res) => {
    const { id } = req.params
    if (data.has(id)) {
        data.remove(id)
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
})

app.post('/cleanup', (req, res) => {
    data.cleanup()
    res.sendStatus(204)
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
