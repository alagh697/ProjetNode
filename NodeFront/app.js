//Module
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const twig = require('twig')
const axios = require('axios')

//Var globale
const app = express()
const port = 8081
const fetch = axios.create({
    baseURL: 'http://localhost:8080/api/v1'
})

//Middleware
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

//Routes
//Accueil
app.get('/', (req, res) => {
    res.redirect('/members')
})

//Liste de tout les membres
app.get('/members', (req, res) => {
    apiCall(req.query.max ? '/members?max='+req.query.max : '/members', 'get', {}, res, (members) => {
        res.render('members.twig', {
            members: members
        })
    })
})

//Afiche un membre
app.get('/members/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'get', {}, res, (member) => {
        res.render('member.twig', {
            member: member
        })
    })
})

//Modification d'un membre
app.get('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'get', {}, res, (member) => {
        res.render('edit.twig', {
            member: member
        })
    })
})
//Modification
app.post('/edit/:id', (req, res) => {
    apiCall('/members/'+req.params.id, 'put', { name: req.body.name }, res, () => {
        res.redirect('/members')
    })
})

//Suppression
app.post('/delete', (req, res) => {
    apiCall('/members/'+req.body.id, 'delete', { name: req.body.name }, res, () => {
        res.redirect('/members')
    })
})

//Ajout d'un membre
app.get('/insert', (req, res) => {
    res.render('insert.twig')
})
//L'ajoutrs

app.post('/insert', (req, res) => {
    apiCall('/members', 'post', { name: req.body.name }, res, () => {
        res.redirect('/members')
    })
})

//Lancement de l'appli
app.listen(port, () => console.log('Started on port ' + port))

//Fonctions

function renderError(res, errMsg)
{
    res.render('error.twig', {
        errorMsg: errMsg
    })
}

function apiCall(url, method, data,  res, next) {
    fetch({
        method: method,
        url: url,
        data: data
    })
    .then((response) => {
        if(response.data.status == 'success')
        {
            next(response.data.result)
        }
        else
        {
            renderError(res, response.data.message)
        }
    })
    .catch((err) => renderError(res, err.message))
}