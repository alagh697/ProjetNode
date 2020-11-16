let db, config

module.exports =(_db, _config) => {
    db= _db
    config= _config
    return Member
}

let Member = class {


    static getAll(max) {
        return new Promise((next) => {

            if (max != undefined && max > 0)
            {
                db.query('Select * from member limit 0, ?', [parseInt(max)])
                    .then((result) => next(result))
                    .catch((err) => next(err))
            }
            else if(max != undefined)
            {
                next(new Error(config.error.wrongMax))
            }
            else
            {
                db.query('Select * from member ')
                    .then((result) => next(result))
                    .catch((err) => next(err))
                
            }
        })
    }

    static getById(id) {

        return new Promise((next) => {
            db.query('Select * from member where id = ?', [id])
            .then((result) => {
                if(result[0] != undefined)
                    next(result[0])
                else
                    next(new Error(config.error.wrongID))
            })
            .catch((err) => next(err))
        })
        
    }

    static add(name) {
        return new Promise((next) => {
            
            if(name != undefined && name.trim() != '' )
            {
                name = name.trim()

                db.query('Select * from member where name = ?', [name])
                    .then((result) => {

                        if(result[0] != undefined)
                            next(new Error(config.error.nameTaken))
                        else
                        {
                            return db.query('Insert into member(name) values(?)', [name])
                        }
                    })
                    .then(() => {
                       return db.query('Select * from member where name = ?', [name])
                    })
                    .then((result) => {
                        next({
                            id: result[0].id,
                            name: result[0].name
                        })
                    })
                    .catch((err) => next(err))

                
            }
            else
            {
                next(new Error(config.error.noName))
            }
        })
    }

    static update(id, name) {
        return new Promise((next) => {
            if(name != undefined && name.trim() != '' )
            {
                name = name.trim()

                db.query('Select * from member where id = ?', [id])
                    .then((result) => {
                        if(result[0] != undefined)
                        {
                            return db.query('Select * from member where name = ? AND id != ?', [name, id])
                        }
                        else
                            next(new Error('Wrong id value'))
                    })
                    .then((result) => {
                        if(result[0] != undefined)
                            next(new Error(config.error.sameName))
                        else
                        {
                            return db.query('Update member set name = ? where id = ?', [name, id])
                        }
                    })
                    .then(() => next(true))
                    .catch((err) => next(err))

            }
            else
            {
                next(new Error(config.error.noName))
            }
        })
    }

    static delete(id) {
        return new Promise((next) => {

            db.query('Select * from member where id = ?', [id])
            .then((result) => {
                if(result[0] != undefined)
                    return db.query('Delete from member where id = ?', [id])
                else
                    next(new Error(config.error.wrongID))
            })
            .then(() => next(true))
            .catch((err) => next(err))
            
        })
    }

}