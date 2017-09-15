module.exports = function () {
    const joi = require('joi')

    const schema = joi.object({
            NODE_ENV: joi.string()
                .allow(['development', 'production', 'test', 'provision']),
            DBHOST: joi.string()
                .default("121.178.26.33"),
            DBPORT: joi.number()
                .default(3306),
            DBNAME: joi.string()
                .default("root"),
            DBPASSWORD: joi.string(),
                // .required(),
            LOGGER_LEVEL: joi.string()
                .allow(['error', 'warn', 'info', 'verbose', 'debug', 'silly'])
                .default('info'),
            LOGGER_ENABLED: joi.boolean()
                .truthy('TRUE')
                .truthy('true')
                .falsy('FALSE')
                .falsy('false')
                .default(true)
        }).unknown()
        .required()

    // const {
    //     error,
    //     value: value
    // } = joi.validate(process.env, envVarschemasSchema)
    // if (error) {
    //     console.log(":@@@@@@@@@",error)
    //     throw new Error(`Config validation error: ${error.name}`)
    // }

    // Return result. 
    // const result = joi.validate({
    //     username: 'abc',
    //     birthyear: 1994
    // }, schema);
    // result.error === null -> valid 

    // You can also pass a callback which will be called synchronously with the validation result. 
    // err === null -> valid 
    return joi.validate(process.env, schema, function (err, value) {
        if (err) {
            console.log(err)
            throw new Error(`Config validation error: ${err}`)
        }

        // console.log(value)
        var config = {
            env: value.NODE_ENV,
            isTest: true,
            isDevelopment: value.NODE_ENV === 'development',
            logger: {
                level: value.LOGGER_LEVEL,
                enabled: value.LOGGER_ENABLED
            },
            inteDbInfo: {
                host: value.DBHOST,
                port: value.DBPORT,
                user: value.DBNAME || "root",
                password:  value.DBPASSWORD || "akdntm007!",
                database: "saltern_integratedserver"
            }
            // ...
        }
        return config;
    });
}