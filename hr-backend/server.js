// Express
import logger from "morgan";
import utils from "./utils";
import express from "express";
import bodyParser from "body-parser";

const port = 4001;
const app = express();

async function main() {

    app.use(bodyParser.json({limit: '5mb'}))
    app.use(logger('dev'));
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "HEAD, GET, POST, PUT, DELETE");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type, Accept");
        next();
    });
    const swaggerUi = require('swagger-ui-express');
    const swaggerDocument = require('./swagger');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.listen(port);
    console.log('Server is running at ' + port);

    //region MongoDB
    const mongoose = require('mongoose');
    const mongodbUrl = "mongodb://localhost:27017/hr";
    try {
        await mongoose.connect(mongodbUrl);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
    //endregion

    //region Employee Schema
    const employeeSchema = new mongoose.Schema({
        "_id": mongoose.Schema.Types.ObjectId,
        "fullname": {
            type: String,
            required: true,
            minLength: 5
        },
        "identityNo": {
            type: String,
            required: true,
            validate: [utils.tcKimlikNoValidator, 'You must provide a valid identity no.']
        },
        "photo": {
            type: String,
            required: false,
            default: utils.NO_IMAGE
        },
        "salary": {
            type: Number,
            required: true,
            min: 2000,
            default: 2000
        },
        "iban": {
            type: String,
            required: true,
            validate: [utils.ibanValidator, 'You must provide a valid iban.']
        },
        "birthYear": {
            type: Number,
            required: false,
            min: 18
        },
        "fulltime": {
            type: Boolean,
            required: true,
            default: true
        },
        "department": {
            type: String,
            enum: ["IT", "Sales", "Finance", "HR"],
            default: "Sales"
        }
    });
    //endregion

    const Employee = mongoose.model('employees', employeeSchema);

    //region REST API
    //region http://localhost:4001/employees?page=1&size=1
    app.get('/employees', async (req, res, next) => {
        try {
            const page = Number.parseInt(req.query.page, 10) || 1;
            const size = Number.parseInt(req.query.size, 10) || 10;
            const offset = (page - 1) * size;

            const employees = await Employee.find(
                {},
                {__v: false, _id: false},
                {skip: offset, limit: size}
            );

            res.type('json').status(200).send(employees);
        } catch (err) {
            next(err);
        }
    });
    //endregion

    //region GET /employees/:identityNo
    app.get('/employees/:identityNo', async (req, res, next) => {
        try {
            const {identityNo} = req.params;

            const employee = await Employee.findOne(
                {identityNo},
                {__v: false, _id: false}
            );

            res.type('json');
            if (employee) {
                res.status(200).send(employee);
            } else {
                res.status(404).send({status: 'Employee is not found!'});
            }
        } catch (err) {
            next(err);
        }
    });
    //endregion

    //region POST /employees
    app.post('/employees', async (req, res, next) => {
        try {
            const emp = req.body;
            emp._id = new mongoose.Types.ObjectId();
            const employee = new Employee(emp);

            await employee.save();
            res.type('json').status(200).send({status: 'OK'});
        } catch (err) {
            res.type('json').status(400).send({status: err.message ? err.message : err});
        }
    });
    //endregion

    //region DELETE /employees/:identityNo
    app.delete('/employees/:identityNo', async (req, res, next) => {
        try {
            const {identityNo} = req.params;

            const employee = await Employee.findOneAndDelete({identityNo});

            res.type('json');
            if (employee) {
                res.status(200).send(employee);
            } else {
                res.status(404).send({status: 'Employee is not found!'});
            }
        } catch (err) {
            next(err);
        }
    });
    //endregion

    //region PUT /employees
    app.put('/employees', async (req, res, next) => {
        try {
            const emp = req.body;
            const updatableFields = [
                'fullname',
                'salary',
                'photo',
                'fulltime',
                'iban',
                'department'
            ];

            const updatedEmp = {};
            for (const field of updatableFields) {
                if (Object.prototype.hasOwnProperty.call(emp, field)) {
                    updatedEmp[field] = emp[field];
                }
            }

            const result = await Employee.updateOne(
                {identityNo: emp.identityNo},
                {$set: updatedEmp},
                {upsert: false}
            );

            res.type('json').status(200).send(result);
        } catch (err) {
            next(err);
        }
    });
    //endregion
    app.use((err, req, res, _next) => {
        console.error(err);
        res.type('json').status(500).send({status: 'Internal Server Error', error: err.message});
    });
    //endregion
}

main().then(() => {
    console.log('Application is up and running!');
});






