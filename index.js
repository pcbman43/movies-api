const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express');
const Session = require('./models/session');
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


YAML = require('yamljs');
const swaggerDocument = YAML.load('swagger.yml');
const movies = [
    {
        id: 1,
        name: 'movie1',
        rating: 3,
        year: 2004,
        poster: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII'
    },
    {
        id: 2,
        name: 'movie2',
        rating: 4,
        year: 1993,
        poster: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAADMElEQVR4nOzVwQnAIBQFQYXff81RUkQCOyDj1YOPnbXWPmeTRef+/3O/OyBjzh3CD95BfqICMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMK0CMO0TAAD//2Anhf4QtqobAAAAAElFTkSuQmCC'
    },
    {
        id: 3,
        name: 'movie3',
        rating: 5,
        year: 2022,
        poster: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAACsklEQVR4nOzdu0vVfxzH8d+RLz/biggMQwh1i4ZASqKplgiHCgkiK7ouXTCKaAkrHILA0EwzlwxDoxDhTEYXulJBhouUYhxwraApqJP0N7wgeC7Px/z6TE/e27kUtwa3/JcoGhui/cXyyWg/PXEq2i9raov2Z+sr0b5893q0P/2yK9rXRGv9cwaAGQBmAJgBYAaAGQBmAJgBYAaAGQBmAJgBYAaAGQBW/KrMRA9aRpei/ZdKXbQvX3oR7Z/c6Y/2rdd+RPupPQ+i/fBYbbT3AmAGgBkAZgCYAWAGgBkAZgCYAWAGgBkAZgCYAWAGgBkAVlrxqDN6MNA1FO1blp+I9qtHjkf7mfl90X7o971oXz8xEu2PtWffb/ACYAaAGQBmAJgBYAaAGQBmAJgBYAaAGQBmAJgBYAaAGQBWaj7wPnpwe9XNaF/7Jvt8/f5nf6L9tsnhaL9yel20721oivaTc6+ivRcAMwDMADADwAwAMwDMADADwAwAMwDMADADwAwAMwDMALCiY+3V6MGuvu/RfqrzSLT/vH422o/OlaN9T3Uw2i+0Po72/Tfmo70XADMAzAAwA8AMADMAzAAwA8AMADMAzAAwA8AMADMAzACw0uz/r6MHHQPt0b67ZzHanzmUfX6/+9NYtK959yHaH20/H+3ffj0c7b0AmAFgBoAZAGYAmAFgBoAZAGYAmAFgBoAZAGYAmAFgBoCVrmzojR4Mbv4W7eueXoj2DUvVaL8wnv3/cNHWF+1/Nmf/T7D4vDHaewEwA8AMADMAzAAwA8AMADMAzAAwA8AMADMAzAAwA8AMACs2dWS/d189OB7t+7duj/ZrdmS/5/Nx58Zof//cw2h/eXddtO8d2BvtvQCYAWAGgBkAZgCYAWAGgBkAZgCYAWAGgBkAZgCYAWAGgP0NAAD//1nhZOAe3V6jAAAAAElFTkSuQmCC'
    }
]

const users = [
    {id: 1, email: "Admin", password: "Password", isAdmin: true},
    {id: 2, email: "User", password: "Password", isAdmin: false}
]

var sessions = [
    {id: 1, userId: 1}
]


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.static(__dirname + '/public'));
app.get('/movies', (req, res) => {
    res.send(movies);
})

app.post('/sessions', (req, res) => {

    if (!req.headers.authorization) {
        return res.status(400).send({error: 'Missing login credentials'})
    }

    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [reqEmail, reqPassword] = credentials.split(':');

    if (!reqEmail || !reqPassword || reqEmail === 'null' && reqPassword === 'null') {
        return res.status(400).send({error: 'One or all params are missing'})
    }


    let user = users.find((user) => user.email === reqEmail);

    if (user) {
        if (user.password === reqPassword) {

            let newSession = Session.create(user.id);
            sessions.push(newSession)

            return res.status(201).send({
                sessionId: newSession.id,
                isAdmin: user.isAdmin,
                sessions: sessions
            })

        } else {
            return res.status(401).send({error: 'Unauthorized: The password you entered is incorrect'})
        }

    } else {
        return res.status(401).send({error: 'Unauthorized: The email you entered is not registered'})
    }
})

app.post('/movies', (req, res) => {
    if (!req.body.name || !req.body.rating || !req.body.year || !req.body.poster) {
        return res.status(400).send({error: 'One or all params are missing'})
    } else {
        return res.status(201).end()
    }
})

function isValidJSON(jsonString) {
    try {
        if (typeof jsonString !== 'string') {
            JSON.parse(JSON.stringify(jsonString))
        } else {
            JSON.parse(jsonString)
        }
        return true
    } catch (e) {
        return false
    }
}

app.patch('/movies', (req, res) => {
    
    let session;

    if (req.headers.authorization) {
        let sessionId = req.headers.authorization

        session = sessions.find((session) => session.id === sessionId)

        if (!session) {
            return res.status(401).send({error: 'Unauthorized'})
        }
    } else {
        return res.status(401).send({error: 'Missing authorization data'})
    }

    var user = users.find((user) => user.id === session.userId)

    if (user.isAdmin === 'false') {
        return res.status(403).send({error: 'Forbidden'})
    
    } else if (isValidJSON(req.body) === false) {
        return res.status(400).send({error: 'Unexpected end of JSON input'})

    } else if (!req.body.name || (typeof req.body.name === 'string') && req.body.name.trim() === '') {
        return res.status(400).send({error: "Invalid title"})

    } else {
        return res.status(204).end()
    }

})

app.delete('/sessions', (req, res) => {
    sessions = sessions.filter((session) => session.id === req.body.sessionId);
    res.status(204).end()
})

app.listen(process.env.PORT, () => {
    console.clear()
    console.log(`App running at http://localhost:${process.env.PORT}. Documentation at http://localhost:${process.env.PORT}/docs`)
})
