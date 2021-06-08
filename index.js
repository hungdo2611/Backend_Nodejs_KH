const express = require('express')
const userRouter = require('./routers/user')
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc")
const port = process.env.PORT
require('./db/db')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BackEnd NodeJs',
            version: '1.0.0',
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ]
    },
    apis: ['./routers/*.js'], // files containing annotations as above
};
const specs = swaggerJsDoc(options)

const app = express()
app.use(express.json())
app.use(userRouter)

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs))

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})