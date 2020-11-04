const path = require('path');
const express = require('express');
const router = express.Router();

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    database: 'miniq',
    password: 'kj1070110kj!'
});

const app = express();

router.get('/', (req, res) =>{

 pool.getConnection(function (err, connection)
    {
        if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);

        var sql = "select * from baseinformation LIMIT 5";
        connection.query(sql, function (err, rows)
        {
            if (err) console.error(err);
            console.log("update에서 1개 글 조회 결과 확인 : ", rows);
            res.render('screen', { title: 'Express', rows : rows[0]});
            connection.release();
        });
    });
});

router.get('/123', (req, res, next)=>{
   res.sendFile(path.join(__dirname, '/', 'temp.html'));
});
module.exports = router;
