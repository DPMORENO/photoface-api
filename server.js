const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const { response } = require('express');
const register = require('./controllers/register')

const knex = require('knex')({
    client: 'pg',
    connection: {
        host : '127.0.0.1',
        user : 'postgres',
        password: '12345',
        database : 'smarbrain'
    }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());


app.post('/signin', (req, res)=> {
    knex.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data =>{
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if (isValid) {
            knex.select('*').from('users')
            .where('email', '=', req.body.email)
            .then( user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('unable to get user'))
        }
    })
    .catch(err => res.status(400).json('Wrong credentials'))
})


app.post('/register', (req, res) => {register.handleRegister (req, res, knex, bcrypt)});


app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    knex.select('*').from('users').where({id: id}).then(user => {
        if (user.length){
            res.json(user[0])
        } else {
res.status(400).json('error getting user');
        }
    })
    .catch(err => res.status(400).json('not found'))
})


app.put('/image', (req, res) => {
    const { id } = req.body;
    knex('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0])
    })
    .catch(err => res.status(400).json('unable to connect'))
})

app.listen(3000, () => {
    console.log('All good');
})