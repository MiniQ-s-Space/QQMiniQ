var express = require('express');
var router = express.Router();

/* MySQL load */ 
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 5,
    host: 'localhost',
    user: 'root',
    database: 'tutorial',
    password: 'kj1070110kj!'

});

/* Use Multer to upload imgFile */
var multer = require('multer');
var upload = multer({ 
    dest: 'public/imgFile/'
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    //그냥 board/ 로 접속할 경우 전체 목록 표시로 리다이렉팅
    res.redirect('/board/list/1');
});


/* write GET */
router.get('/write', function (req, res, next) {
    res.render('write', { title: "게시판 글 쓰기" });
});


/* list GET */
router.get('/list/:page', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        //Use the connection
        var sqlForSelectList = "SELECT idx, creator_id, title, hit FROM board";
        connection.query(sqlForSelectList, function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.render('list', { title: ' 게시판 전체 글 조회', rows: rows });
            connection.release();
            //Don't use the connection here, it has been returned to the pool
        });
    });
});

/* write POST */
router.post('/write', upload.single('imgFile'), function (req, res, next) {

    var creator_id = req.body.creator_id;
    var title = req.body.title;
    var content = req.body.content;
    var imgFile = req.file.filename;
    var passwd = req.body.passwd;
    var datas = [creator_id, title, content, imgFile, passwd];

    pool.getConnection(function (err, connection)
    {
        //Use the connection
        var sqlForInsertBoard = "insert into board(creator_id, title, content,imgFile, passwd) values(?,?,?,?,?)";
        connection.query(sqlForInsertBoard, datas, function (err, rows) 
        {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            res.redirect('/board');
            connection.release();

            //Don't use the connection here, it has been returned to the pool
        });
    });

});

/* read logic GET */
router.get('/read/:idx', function (req, res, next)
{
    var idx = req.params.idx;

    pool.getConnection(function (err, connection)
    {
        var sql = "select idx, creator_id, title, content, hit, imgFile from board where idx=?";
        connection.query(sql, [idx], function (err, row)
        {
            if (err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ", row);
            res.render('read', { title: "글 조회", row: row[0] });
            connection.release();
        });
    });
});

/* update GET */
router.get('/update', function (req, res, next)
{
    var idx = req.query.idx;

    pool.getConnection(function (err, connection)
    {
        if (err) console.error("커넥션 객체 얻어오기 에러 : ", err);

        var sql = "select idx, creator_id, title, content, hit, imgFile from board where idx=?";
        connection.query(sql, [idx], function (err, rows)
        {
            if (err) console.error(err);
            console.log("update에서 1개 글 조회 결과 확인 : ", rows);
            res.render('update', { title: "글 수정", row: rows[0] });
            connection.release();
        });
    });
});


/* update logic POST */
router.post('/update', upload.single('imgFile'), function (req, res, next)
{
    var idx = req.body.idx;
    var creator_id = req.body.creator_id;
    var title = req.body.title;
    var content = req.body.content;
    var imgFile = req.file.filename;
    var passwd = req.body.passwd;
    var datas = [creator_id, title, content, imgFile, passwd];

    pool.getConnection(function (err, connection)
    {
        var sql = "update board set creator_id=?, title=?, content=?, imgFile=? where idx=? and passwd=?";
        connection.query(sql, [creator_id, title, content, imgFile, idx, passwd], function (err, result)
        {
            console.log(result);
            if (err) console.error("글 수정 중 에러 발생 err : ", err);

            if (result.affectedRows == 0) {
                res.send("<script>alert('패스워드가 일치하지 않거나, 잘못된 요청으로 인해 값이 변경되지 않았습니다.');history.back();</script>");
            }
            else
            {
                res.redirect('/board/read/' + idx);
            }
            connection.release();
        });
    });
});


module.exports = router;