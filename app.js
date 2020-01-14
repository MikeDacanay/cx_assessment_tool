const express     = require("express"),
    bodyParser    = require("body-parser"),
    mysql         = require("mysql"),
    path          = require("path"),
    ejs           = require("ejs"),
    Readable      = require("stream").Readable,
    fs            = require("fs");

const app = express();
const stream = new Readable();

const sql = require('./database/queries');

const PDFReactor = require('../PDFreactor/wrappers/nodejs/lib/PDFreactor');
const pdfReactor = new PDFReactor("https://cloud.pdfreactor.com/service/rest");

app.use(express.json()); 
app.use(express.static(`${__dirname}/bin_dev`));
app.use(express.static(`${__dirname}/PDF`));
app.use(express.static(`${__dirname}`)); 
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'html');
app.engine("html", require("ejs").renderFile);

app.set('views', [path.join(__dirname, "bin_dev"), path.join(__dirname, "PDF")]);

// ------------------------------------------------------------
// SQL CONFIGURATION 
// ------------------------------------------------------------

const conn = mysql.createPool({
    connectionLimit: 100,
    host: "72.10.48.193",
    user: "oracleroot", 
    password: "DBase_0243",
    database: "cx_maturity",
    multipleStatements: true 
}); 

// ------------------------------------------------------------
// DECLARING VARIABLES
// ------------------------------------------------------------

let userArr = []; 
let userID;
let ansArr = []

// ------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------

app.get('/cx/maturity/pdf/:id', (req, res) => {
    id = req.params.id;    
    const config = {
        // document: `https://oracle.assessment-tools.com/htmlversion/${id}`,
        document: `http://dev.assessment-tools.com/htmlversion/${id}`,
        addLinks: true,
        pixelsPerInch:71,
        javaScriptSettings:{ enabled:true }
    }

    var result;

    async function printPDF() {
        try{
            result = await pdfReactor.convert(config);
            // console.log(result)

            fs.writeFile(`./bin_dev/cxpdf${id}.pdf`, result.document, 'base64', function(err) {
                if (err) {
                    console.log(err)
                } else {
                    fs.readFile(`./bin_dev/cxpdf${id}.pdf`, (err, data) => {
                        res
                        .contentType('application/pdf')
                        .send(data);
                    })
                }
            });
        } catch (err) {
            console.log(err)
        }
    }
    printPDF()
})


app.get('/htmlversion/:id', (req, res) => {
    res.render( 'cx-content' );
})

app.get('/cx/maturity', (req, res) => {
    res.render('index'); 
})

app.post('/api', (req,res) => {
    console.log("----------------------------------------")

    const data      = req.body,
        likerts     = data.likerts, 
        dials       = data.dials,
        vertfcs     = data.vertfcs,
        checkboxes  = data.checkboxes;
        sliders  = data.sliders;

    userID = Date.now();

    createCompany(userArr, data)
    .then(() => {

        likerts.forEach(createAnswersArray);
        dials.forEach(createAnswersArray);
        vertfcs.forEach(createAnswersArray);
        checkboxes.forEach(createAnswersArray);
        sliders.forEach(createAnswersArray); 
        return ('ok')

    }).then(() => {
        const results = insertAnswers(ansArr);
        return (results);
    })
    .then( () => {
        const results = updateAnswers();
        return results
    })
    .then(() => {
        const results = createOverallResults();
        return results
    })
    // .then(el => {
    //     return ('done')
    // })
    .then(() => {
        res.status(200).json({
            status: 'success',
            results: data.length,
            data: {
                data: 'success'
            }  
        });
    })
    .catch((err) => {
        console.log(err)
    });
}); 
 
app.get('/api2', (req, res) => {

    conn.query(`SELECT * FROM results WHERE user_id = ?`, userID, (err, results) => {
        if (err) throw err;
        const data = results;
        // console.log(results)

        res.send({ 
            data 
        });
    })
})

app.get('/pdfdata/:id', (req, res) => {

    sqlID = req.params.id;

    conn.query(`SELECT ans_value, question_id, ans_section FROM answers WHERE user_id = ? ORDER BY question_id ASC;
                SELECT companyName, id FROM users WHERE id = ?;
                SELECT BroadcastScore, ResponsiveScore, RelationshipScore, LifecycleScore FROM results WHERE user_id = ?
                `, [sqlID, sqlID, sqlID], (err, results, fields) => {
                // 1577293819790
        if (err) throw err; 

        var pdfData = {

            TotalScore: Math.round((results[2][0].BroadcastScore + results[2][0].ResponsiveScore + results[2][0].RelationshipScore + results[2][0].LifecycleScore)/4),
            
            BroadcastScore: results[2][0].BroadcastScore,
            ResponsiveScore: results[2][0].ResponsiveScore,
            RelationshipScore: results[2][0].RelationshipScore,
            LifecycleScore: results[2][0].LifecycleScore,

            companyName: results[1][0].companyName,
            companyID: results[1][0].id,

            broadcast_1: results[0][0].ans_value,
            broadcast_2: results[0][1].ans_value,
            broadcast_3: results[0][2].ans_value,
            broadcast_4: results[0][3].ans_value,
            broadcast_5: results[0][4].ans_value,
    
            responsive_1: results[0][9].ans_value,
            responsive_2: results[0][10].ans_value,
            responsive_3: results[0][11].ans_value,
            responsive_4: results[0][12].ans_value,
            responsive_5: results[0][13].ans_value,
            responsive_6: results[0][14].ans_value,
            responsive_7: results[0][15].ans_value,
            responsive_8: results[0][16].ans_value,
            responsive_9: results[0][17].ans_value,
            responsive_10: results[0][18].ans_value,
    
            relationship_1: results[0][19].ans_value,
            relationship_2: results[0][20].ans_value,
            relationship_3: results[0][21].ans_value,
            relationship_4: results[0][22].ans_value,
            relationship_5: results[0][23].ans_value,
            relationship_6: results[0][24].ans_value,
            relationship_7: results[0][25].ans_value,
            relationship_8: results[0][26].ans_value,
            relationship_9: results[0][27].ans_value,
            relationship_10: results[0][28].ans_value,
            relationship_11: results[0][29].ans_value,
            relationship_12: results[0][30].ans_value,
            relationship_13: results[0][31].ans_value,
    
            lifecycle_1: results[0][32].ans_value,
            lifecycle_2: results[0][33].ans_value,
            lifecycle_3: results[0][34].ans_value,
            lifecycle_4: results[0][35].ans_value,
            lifecycle_5: results[0][36].ans_value,
            lifecycle_6: results[0][37].ans_value,
            lifecycle_7: results[0][38].ans_value,
            lifecycle_8: results[0][39].ans_value
        }
        res.json({data: pdfData});
    })    
});    



function createCompany(arr, el) {
    return new Promise( (res, rej) => {
        compName = el.company;
        compSize = el.revenue;
        compIndustry = el.industry;
        numEmployees = el.employees;
        compCountry = el.country;
        arr.push(userID, compName, compSize, compIndustry, numEmployees, compCountry);
        console.log(arr)
        conn.query(sql.insertUser, arr, (err, results) => {
            if(err) throw err;  
            userArr = [];
            res(); 
        })
    })
}; 

function createAnswersArray(el) { 
    return new Promise( (res, rej) => {
        let ansRow = [];

        questionID = el.id;
        value = el.val;
        textAns = el.choseAns;

        ansRow.push(userID, questionID, value, `${textAns}`); 
        ansArr.push(ansRow);

        res();
    })
};  

function insertAnswers(elem) { 
    return new Promise( (res, rej) => {

        conn.query(sql.insertAnswer, [elem], (err, results) => {
            if(err) throw err;
            res(results);
        });
    })
}; 

function updateAnswers () {
    return new Promise( (res, rej) => {
        conn.query(sql.updateAnswers, userID, (err, results, fields) => {
            if(err) throw err;
            ansArr = [];
            res(results);
        });
    })
};

function createOverallResults () {
    return new Promise( (res, rej) => {
        conn.query(sql.insertResults, [userID, userID, userID, userID, userID, userID, userID, userID, userID, userID, userID, userID, userID, userID, userID, userID, userID], (err, results) => {
            if(err) throw err;
            res(results); 
        });
    }) 
};


app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("Customer Experience Assessment Tool is online")
});
