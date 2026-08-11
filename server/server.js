import express from 'express'

const server = express()

server.get('/', (req, res) => {
    res.send('The server is running')
})

server.listen (4000, () => {
    console.log('The server is running on port 4000')
})