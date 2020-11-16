const express = require('express')
//const expressOasGenerator = require('express-oas-generator')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./assets/swagger.json')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const {success, error, checkAndChange} = require('./assets/functions')
const config = require('./assets/config')
const mysql = require('promise-mysql');
const member = require('./assets/classes/member')

mysql.createConnection({
    host: config.db.host, 
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {

    console.log('Connected')

    const app = express()
    //expressOasGenerator.init(app, {})

    let MembersRouter = express.Router()
    let Member = require('./assets/classes/member')(db, config)

    app.use(morgan('dev'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true}))
    app.use(config.rootAPI+'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    MembersRouter.route('/')
        //Liste des membre
        .get(async (req, res) => {
            let allMembers = await Member.getAll(req.query.max)
            res.json(checkAndChange(allMembers)) 
        })

        //Ajouter un membre    
        .post(async (req, res) => {
            let addmember = await Member.add(req.body.name)
            res.json(checkAndChange(addmember))
        })

        MembersRouter.route('/:id')
            //Affiche un membre par son id
            .get(async (req, res) => {
                let member = await Member.getById(req.params.id)
                res.json(checkAndChange(member))
            })

            //Met à jour un membre par son id
            .put(async (req, res) => {
                let updatemember = await Member.update(req.params.id, req.body.name)
                res.json(checkAndChange(updatemember)) 
            })

            //Supprime un membre par son id
            .delete(async (req, res) => {
                let deleteMember = await Member.delete(req.params.id)
                res.json(checkAndChange(deleteMember))
            })

        app.use(config.rootAPI + 'members', MembersRouter)

        app.listen(config.port, () => {
            console.log('Started on port ' + config.port)
        })

}).catch((err) => {
    console.log('Error')
    console.log(err.message)
})



