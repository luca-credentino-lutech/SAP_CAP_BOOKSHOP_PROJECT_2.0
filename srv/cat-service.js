const cds = require('@sap/cds')

module.exports = cds.service.impl(async function() {
    
    this.on('getUser', req => {
        return {
            id: req.user.id,
            // password: req.user.password,
            // role: req.user.roles
        
        }
    })
})