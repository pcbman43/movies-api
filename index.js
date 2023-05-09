const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express');
const Session = require('./models/session');
const fs = require('fs');
const https = require('https')
const WebSocket = require('ws')
require('dotenv').config()
const path = require('path');
const dirname__ = path.resolve();
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify');
const { OAuth2Client } = require('google-auth-library');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const credentials = {
    key: fs.readFileSync(process.env.KEY),
    cert: fs.readFileSync(process.env.CERT)
}

const httpsServer = https.createServer(credentials, app);
const WebSocketServer = new WebSocket.Server({server: httpsServer});

process.on('SIGINT', () => {
    console.log('Closing WebSocket server');
    WebSocketServer.close();
    process.exit();
});

YAML = require('yamljs');
const swaggerDocument = YAML.load('swagger.yml');
const moviesFile = './public/movie-data/movies.json';

var movies = require(moviesFile);

const users = [
    {id: 1, email: "Admin", password: "Password", isAdmin: true},
    {id: 2, email: "User", password: "Password", isAdmin: false}
]

var sessions = [
    {id: 1, userId: 1, createdAt: '2023-05-04T08:36:57.652Z'}
]


app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.static(__dirname + '/public'));
app.get('/movies', (req, res) => {
    res.send(movies);
})

const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID
});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
}

fs.watch(moviesFile, (eventType, filename) => {

    if (eventType === 'change') {
        fs.readFile(moviesFile, (error, data) => {
            if (error) {
                console.error(error);
                return;
            }
            try {
                if (data.length > 0) {
                    movies = JSON.parse(data)
                    updateClients()
                } else {
                    //console.log('Data is empty')
                    return
                }
            } catch (error) {
                console.error(`Error parsing JSON: ${error}`);
                console.log(`recieved data - ${data}`)
            }
        });
    }
});

const logFile = './movie_logs/logs.csv';

var logs = fs.readFileSync(logFile)
logs = parse(logs, {columns: true}, (err, output) => {
    return output;
});

fs.watch(logFile, (eventType, filename) => {
    if (eventType === 'change') {
        fs.readFile(logFile, (error, data) => {
            if (error) {
                console.error(error);
                return;
            }
            try {
                if (data.length > 0) {
                    logs = parse(data, {columns: true}, (err, output) => {
                        return output;
                    });
                    updateClients('updateLog')
                } else {
                    //console.log('Data is empty')
                    return
                }
            } catch (error) {
                console.error(`Error parsing CSV: ${error}`);
            }
        });
    }
});

async function generateLogEntry(req) {
    var logLength
    var logContent
    var data = fs.readFileSync(logFile)
    var output = parse(data, {columns: false}, (err, output) => {
        return output;
    });
    logContent = await output;
    logLength = output.length

    var logId = logLength.toString();
    var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    var logEntryRaw = [logId, date, req.method];
    logContent.push(logEntryRaw);
    stringify(logContent, {quoted: true}, (err, output) => {
        fs.writeFile(logFile, output, (err) => {
            if (err) {
                console.log('Error writing log file:', err);
                return;
            }
        });
    });

    updateClients('updateLog');
}

function addMovie(body) {
    var posterExt = body.poster.substring(body.poster.indexOf('/') + 1, body.poster.indexOf(';'));
    var posterFile = `./public/movie-data/posters/${body.id}.${posterExt}`;
    var posterPublicFile = `/movie-data/posters/${body.id}.${posterExt}`;
    var imageData = body.poster.replace(/^data:image\/\w+;base64,/, "");

    fs.writeFile(posterFile, imageData, 'base64', (err) => {
        if (err) {
            console.log('Error writing poster file:', err);
            return;
        }

        body.poster = posterPublicFile;
        movies.push(body);
        fs.writeFile(moviesFile, JSON.stringify(movies, null, 4), (err) => {
            if (err) {
                console.log('Error writing movies file:', err);
                return;
            }
        });
    });
}

async function updateMovie(body) {
    const index = movies.findIndex((movie) => movie.id === body.id);

    if (index !== -1) {
        const oldPosterFile = path.join(dirname__, 'public', movies[index].poster);
        try {
            const oldImageData = await fs.promises.readFile(oldPosterFile, { encoding: 'base64' });

            if (movies[index].poster !== body.poster) {
                if (body.poster.indexOf('base64') === -1) {
                    console.log('Error: poster data is not base64');
                    throw new Error('Poster data is not base64');
                }

                if (oldImageData !== body.poster) {
                    try {
                        await fs.promises.unlink(oldPosterFile);
                    } catch (err) {
                        return;
                    }

                    var newPosterExt = body.poster.substring(body.poster.indexOf('/') + 1, body.poster.indexOf(';'));
                    var oldFileName = path.basename(movies[index].poster, path.extname(movies[index].poster))
                    if (oldFileName.includes('v')) {
                        try {
                            var oldPosterVersion = Number(oldFileName.replace(`${movies[index].id}.v`, ''));
                        } catch (err) {
                            console.log('Error converting oldPosterVersion to number')
                            return;
                        }
                        var newPosterFile = `./public/movie-data/posters/${body.id}.v${oldPosterVersion+=1}.${newPosterExt}`;
                    } else {
                        var newPosterFile = `./public/movie-data/posters/${body.id}.v2.${newPosterExt}`;
                    }
                    const newImageData = body.poster.replace(/^data:image\/\w+;base64,/, "");
                    await fs.promises.writeFile(newPosterFile, newImageData, 'base64');
                    movies[index] = body;
                    const newPosterPublicFile = newPosterFile.substring(newPosterFile.indexOf('/movie-data'));
                    movies[index].poster = newPosterPublicFile;
                } else {
                    movies[index] = body;
                }
            } else {
                movies[index] = body;
            }

            await fs.promises.writeFile(moviesFile, JSON.stringify(movies, null, 4));
        } catch (err) {
            console.log('Error:', err);
        }
    }
}

function deleteMovie (body) {
    const index = movies.findIndex((movie) => movie.id === body.id);
    if (index !== -1) { 
        var posterFile = path.join(dirname__, 'public', movies[index].poster)
        fs.unlink(posterFile, (err) => {
            if (err) {
                console.log('Error deleting poster file:', err);
                return;
            }
        });

        movies.splice(index, 1);
    }


    fs.writeFile(moviesFile, JSON.stringify(movies, null, 4), (err) => {
        if (err) {
            console.log('Error writing movies file:', err);
            return;
        }
    });

}

function updateClients(type = 'update') {
    WebSocketServer.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            if (type === 'update') {
                client.send('update');
            } else if (type === 'updateLog') {
                client.send('updateLog');
            }
        }
    });
}


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

function checkAuth(req, res, next) {
    try {
    if (req.headers.authorization) {
        let sessionId = req.headers.authorization;
        var session = sessions.find((session) => session.id === sessionId);

        if (!session) {
            return res.status(401).send({ error: "Unauthorized" });
        }

        var user = users.find((user) => user.id === session.userId);

        if (user.isAdmin) {
            next();
        } else {
            return res.status(403).send({ error: "Forbidden" });
        }
        
    } else {
        return res.status(401).send({ error: "Missing authorization data" });
    }
    } catch (e) {
        return res.status(401).send({ error: "Unauthorized" });
    }
}

app.post('/sessions', async (req, res) => {

    if (req.body.hasOwnProperty('credential')) {
        try {
            const value = await verify(req.body.credential)
            
            let newSession = Session.create(value.email);
            sessions.push(newSession)

            return res.status(201).send({
                sessionId: newSession.id,
                isAdmin: true
            })
            
        } catch (e) {
            return res.status(400).send({error: 'Login unsuccessful'});
        }
    }

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
                isAdmin: user.isAdmin
            })

        } else {
            return res.status(401).send({error: 'Unauthorized: The password you entered is incorrect'})
        }
        
    } else {
        return res.status(401).send({error: 'Unauthorized: The email you entered is not registered'})
    }
})

app.post('/movies', checkAuth, (req, res) => {
    
    if (isValidJSON(req.body) === false) {
        return res.status(400).send({error: 'Unexpected end of JSON input'})

    } else if (!req.body.name || !req.body.rating || !req.body.year || !req.body.poster) {
        return res.status(400).send({error: 'One or all params are missing'})

    } else if (!req.body.name || (typeof req.body.name === 'string') && req.body.name.trim() === '') {
        return res.status(400).send({error: "Missing title"})

    } else {
        addMovie(req.body)
        generateLogEntry(req)
        return res.status(201).end()
    }

})

app.patch('/movies', checkAuth, (req, res) => {
    
    if (isValidJSON(req.body) === false) {
        return res.status(400).send({error: 'Unexpected end of JSON input'})
        
    } else if (!req.body.name || (typeof req.body.name === 'string') && req.body.name.trim() === '') {
        return res.status(400).send({error: "Invalid title"})
        
    } else {
        updateMovie(req.body)
        generateLogEntry(req)
        return res.status(204).end()
    }

})

app.delete('/movies', checkAuth, (req, res) => {
    
    if (isValidJSON(req.body) === false) {
        return res.status(400).send({error: 'Unexpected end of JSON input'})

    } else {
        deleteMovie(req.body)
        generateLogEntry(req)
        return res.status(204).end()
    }

})

app.delete('/sessions', (req, res) => {
    sessions = sessions.filter((session) => session.id === req.body.sessionId);
    res.status(204).end()
})

app.get('/logs', (req, res) => {
    res.status(200).send(logs)
})

app.get('/env', (req, res) => {
    res.status(200).send({client_id: process.env.GOOGLE_CLIENT_ID})
})

try {
    httpsServer.listen(process.env.PORT, () => {
        //console.clear()
        console.log(`App running at https://localhost:${process.env.PORT}. Documentation at https://localhost:${process.env.PORT}/docs`)
    })
} catch (e) {
    console.log(e)
}
