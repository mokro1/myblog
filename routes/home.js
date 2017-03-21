
// 使用 路由中间件

const express = require('express');

// 实例路由中间件
const router = express.Router();

// 数据库
const db = require('../config/db');

// 设计路由

// /
router.get('/', (req, res) => {
  
	// let query = 'select * from posts';
	// db.query(query,(err,result) =>{
	// 	if(err) {
	// 		return res.send('数据库内部错误');
	// 	}
	// 	res.render('home/index', {arts: result});
	// });
    let page = parseInt(req.query.page || 1); // 当前页码
    let len = 3; // 每页4条
    let offset = (page - 1) * len;

    // 页码
    let pages = {
        current: page,
        prev: page - 1,
        next: page + 1
    }

    let query = 'select * from posts order by id desc limit ?, ?';

    db.query(query, [offset, len], (err, posts) => {
        if(err) {
            return res.send('内部错误！');
        }

        db.query('select count(*) as total from posts', (err, total) => {
            if(err) {
                return res.send('内部错误！');
            }

            // pages.total = result[0].total;
            // 总共多少页
            pages.pageCount = Math.ceil(total[0].total / len);

            res.render('home/index', {posts: posts, pages: pages});
        });
    });
});

// /about
router.get('/about', (req, res) => {
    res.render('home/about', {});
});

// /article
router.get('/article', (req, res) => {
	  let query = 'select * from posts where id=?';
      db.query(query,req.query.id,(err,result)=>{
          if(err){ 
              return res.send('数据库内部错误');
        }
        res.send('home/article',result[0]);
      })
    //res.render('home/article', {});
});

// /join
router.get('/join', (req, res) => {
    res.render('home/join', {});
});

// /login
router.get('/login', (req, res) => {
    res.render('home/login', {});
});

// /register
router.get('/register', (req, res) => {
    res.render('home/register', {});
});

// 注册
router.post('/register', (req, res) => {
    // 
    // console.log(req.body);

    // insert into 表名 (字段名1, 字段2...) values(值1, 值2...);
    // insert into 表名 set 字段名1=值1, 字段名2=值2...;

    // md5加密
    req.body.pass = db.md5(req.body.pass);    

    db.query('insert into users set ?', req.body, (err, result) => {
        if(err) {
            return res.json({
                code: 10002,
                msg: '数据库错误!'
            });
        }
        // 成功时
        return res.json({
            code: 10000,
            msg: '注册成功！'
        })
    });
});

// 登录
router.post('/login', (req, res) => {

    // console.log(req.body);
    // 
    req.body.pass = db.md5(req.body.pass);

    // select 字段名1, 字段名2... from 表名 where 条件

    // sql 注入风险 不去考虑
    let query = 'select * from users where email=? and pass=?';
    db.query(query, [req.body.email, req.body.pass], (err, result) => {
        if(err) {
            return res.json({
                code: 10002,
                msg: '用户名或密码错误'
            });
        }
        // 存登录信息
        req.session.loginfo = result[0];

        res.json({
            code: 10000,
            msg: '登录成功!'
        });
    });
});

// 
router.get('/logout', (req, res) => {
    // 清掉session
    req.session.loginfo = null;

    res.redirect('/');
});

module.exports = router;