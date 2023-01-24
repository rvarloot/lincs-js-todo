const { add, onChange, remove, cleanup } = function() {
    const listContainer = document.getElementById('list')
    const newNameField = document.getElementById('new-name')

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
            rmLink.onclick = () => remove(id)
            li.appendChild(rmLink)
            
            return li
        })

        listContainer.replaceChildren(...listElements)
    }

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

    async function add() {
        const name = newNameField.value

        try {
            const res = await fetch('/data', {
                method: 'POST',
                body: name,
                headers: { "Content-Type": "text/plain" },  // This comma is free, use it!
            })

            if (!res.ok) throw new Error(`fetch error code ${res.status}`)

            refresh()
            newNameField.value = ''
        } catch (err) {
            console.error(err)
        }
    }

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

    refresh()
    setInterval(refresh, 1000)

    return { add, onChange, remove, cleanup }
}()