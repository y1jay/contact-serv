const connection = require("../db/mysql_connection");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var crypto = require("crypto");

// @desc    회원가입
// @route   POST /api/v1/users
// @route   POST /api/v1/users/register
// @route   POST /api/v1/users/
// @parameters  email, passwd
exports.signUp = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  const hashedPasswd = await bcrypt.hash(passwd, 8);

  // 이메일이 정상적인가 체크
  if (!validator.isEmail(email)) {
    res.status(500).json({ success: false, message: "이게 이메일이냐?" });
    return;
  }
  // 유저 인서트
  let query = "insert into contact_user (email, passwd) values ? ";
  let data = [email, hashedPasswd];
  let user_id;
  try {
    [result] = await connection.query(query, [[data]]);
    user_id = result.insertId;
  } catch (e) {
    if (e.errno == 1062) {
      // 이메일 중복된것 이다.
      res
        .status(400)
        .json({ success: false, errno: 1, message: "이메일 중복" });
      return;
    } else {
      res.status(500).json({ success: false, error: e });
      return;
    }
  }

  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);

  query = "insert into contact_token (token, user_id) values ( ? , ? )";
  data = [token, user_id];

  try {
    [result] = await connection.query(query, data);
    res.status(200).json({ success: true, token: token });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// 로그인 api를 개발하세요

// @desc   로그인
// @route   POST /api/v1/users/login
// @paramaeters  email, passwd
// async 는 동시에 처리할 수 있게해라
exports.LoginUser = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = `select * from contact_user where email ="${email}"`;

  try {
    [rows] = await connection.query(query);

    // 비밀번호 체크 : 비밀번호가 서로 맞는지 확인
    let savedPasswd = rows[0].passwd;

    const isMatch = await bcrypt.compare(passwd, savedPasswd);
    if (isMatch == false) {
      res.status(400).json({ succese: false, result: isMatch });
      return;
    }
    let token = jwt.sign(
      { user_id: rows[0].id },
      process.env.ACCESS_TOKEN_SECRET
    );
    query = `insert into contact_token (token,user_id) values(?,?)`;

    let data = [token, rows[0].id];
    try {
      [result] = await connection.query(query, data);
      res.status(200).json({ succese: true, result: isMatch, token: token });
      return;
    } catch {
      res.status(500).json({ error: e });
      return;
    }
  } catch {
    res.status(500).json({ error: e });
  }
};

// 패스워드 변경 API를 설계/개발하시오

// @desc   패스워드 변경
// @route   POST /api/v1/users/change
// @parameters  email passwd

exports.changePasswd = async (req, res, next) => {
  let email = req.body.email;
  let passwd = req.body.passwd;
  let new_passwd = req.body.new_passwd;
  const hashedPasswd = await bcrypt.hash(new_passwd, 8);

  //이 유저가, 맞는 유저인지 체크
  let query = `select passwd from contact_user where email = "${email}"`;
  try {
    [rows] = await connection.query(query);
    let savedPasswd = rows[0].passwd;
    let isMatch = await bcrypt.compare(passwd, savedPasswd);
    let thisMatch = await bcrypt.compare(passwd, new_passwd);
    if (isMatch != true) {
      res.status(401).json({ succese: false, result: isMatch });
      return;
    } else if (thisMatch != false) {
      res.status(418).json({ succese: false, result: thisMatch });
      return;
    }
  } catch (e) {
    res.status(500).json({ error: e });
    return;
  }
  query = `update contact_user set passwd ="${hashedPasswd}" where email = "${email}"`;
  try {
    [result] = await connection.query(query);
    if (result.affectedRows == 1) {
      res.status(200).json({ succese: true });
      return;
    } else {
      res.status(200).json({ succese: false });
      return;
    }
  } catch (e) {
    res.status(500).json({ succese: false, error: e });
  }
};

// 유저의 id값으로 내정보를 가져오는 API 개발

// @desc     내정보 가져오기
// @route    GET/api/v1/users/

exports.getMyInfo = async (req, res, next) => {
  // req.user는 auth에 담아뒀었다.
  res.status(200).json({ succese: true, result: req.user });
};

// @ desc   로그아웃 api: DB에서 해당 유저의 현재 토큰값을 삭제
// @ route  POST /api/v1/users/Logout
// @parameters  X

exports.Logout = async (req, res, next) => {
  // 토큰테이블에서, 현재 이 헤더에 있는 토큰으로, 삭제한다.
  let token = req.user.token;
  let user_id = req.user.id;
  let query = `delete from contact_token where user_id = ${user_id} and token = "${token}"`;

  try {
    [result] = await connection.query(query);
    if (result.affectedRows == 1) {
      res.status(200).json({ succese: true, result: result });
      return;
    } else {
      res.status(400).json({ succese: false });
      return;
    }
  } catch (e) {
    res.status(500).json({ succese: false, error: e });
    return;
  }
};

// 안드로이드 사용하고, 아이폰도 사용하고, 집 컴도 사용.
// 이 서비스를 각각의 디바이스마다 다 로그인하여 사용중 이었다
// 전체 디바이스(기기) 전부 다 로그아웃을 시키게 하는 API

// @ desc   전체 기기에서 모두 로그아웃 하기
// @ route  POST /api/v1/users/LogoutALL

exports.LogoutAll = async (req, res, next) => {
  let user_id = req.user.id;

  let query = `delete from contact_token where user_id = ${user_id} `;

  try {
    [result] = await connection.query(query);

    res.status(200).json({ succese: true, result: result });
    return;
  } catch (e) {
    res.status(500).json({ succese: false, error: e });
    return;
  }
};

// 회원탈퇴 : db에서 해당 회원의 유저 테이블 정보 삭제
// => 유저 정보가 있는 다른 테이블도 정보 삭제

// @ desc   회원탈퇴 : 유저 테이블에서 삭제, 토큰테이블에서 삭제
// @ route  DELETE  /api/v1/users

exports.dethUser = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `delete from contact_user where id = ${user_id}`;
  const conn = await connection.getConnection();
  try {
    await conn.beginTransaction();
    // 첫번째 테이블에서 정보 삭제
    [result] = await conn.query(query);
    // 두번째 테이블에서 정보 삭제
    query = `delete from contact_token where user_id = ${user_id}`;
    [result] = await conn.query(query);

    await conn.commit();
    res.status(200).json({ success: true });
  } catch (e) {
    await conn.rollback();
    res.status(500).json({ success: false, error: e });
  } finally {
    conn.release();
  }
};

// 유저가 패스워드를 분실!

// 1. 클라이언트가 패스워드 분실했다고 서버한테 요청
//    서버가 패스워드를 변경할 수 있는 URL을 클라이언트한테 보내준다.
//    (경로에 암호화된 문자열을 보내줍니다- 토큰역할)

// @desc  패스워드 분실
// @route POST  /api/v1/users/forgotpasswd
exports.forgotPasswd = async (req, res, next) => {
  let user = req.user;
  // 암호화된 문자열 만드는 방법
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetPasswdToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 유저 테이블에, reset_passwd_token 컬럼에 저장.
  let query = "update contact_user set reset_passwd_token = ? where id = ? ";
  let data = [resetPasswdToken, user.id];

  try {
    [result] = await connection.query(query, data);
    user.reset_passwd_token = resetPasswdToken;
    res.status(200).json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
// 2.  클라이언트는 해당 암호화된 주소를 받아서, 새로운 비밀번호를 함께
//     서버로 보냅니다.
//      서버는, 이 주소가 진짜 유효한지 확인해서, 새로운 비밀번호로 셋팅

// @desc  리셋 패스워드 토큰을, 경로로 만들어서, 바꿀 비번과 함께 요청
//        비번 초기화 ( reset passwd api )
// @route  POST /api/v1/users/resetPAsswd/:resetPasswdToken

exports.resetPasswd = async (req, res, next) => {
  const resetPasswdToken = req.params.resetPasswdToken;
  const user_id = req.user.id;

  let query = `select * from contact_user where id = ${user_id}`;

  try {
    [rows] = await connection.query(query);
    savedResetPasswdToken = rows[0].reset_passwd_token;
    if (savedResetPasswdToken !== resetPasswdToken) {
      res.status(400).json({ succese: false });
    }
  } catch (e) {
    res.status(500).json({ succese: false, error: e });
    return;
  }
  let passwd = req.body.passwd;
  const hashedPasswd = await bcrypt.hash(passwd, 8);
  query = `update contact_user set passwd = "${hashedPasswd}", reset_passwd_token = '' where id = ${user_id}`;

  delete req.user.reset_passwd_token;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ succese: true, data: req.user });
  } catch (e) {
    res.status(500).json({ succese: false, error: e });
  }
};
