const connection = require("../db/mysql_connection");
const ErrorResponse = require("../utils/errorResponse");
// 모든 주소록 데이터를 다 가져와서, 클라이언트한테 보내는것은
// 문제가 있습니다.
// 현업에서는 20~30개 사이로 끊어서 보냅니다.

// @desc    모든 정보를 다 조회
// @route   GET /api/v1/contact?offset=0limit=20
// @access  Public
exports.getcontacts = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  try {
    const [rows, fields] = await connection.query(
      `select*from contact where shared is null or shared=1 limit ${offset},${limit}`
    );
    let count = rows.length;
    res.status(200).json({ succese: true, items: rows, count: count });
  } catch (e) {
    next(new ErrorResponse("에러 발생", 418));
  }
};

// @desc    해당 id의 정보 조회
// @route   GET /api/v1/contact/id
// @access  Public
// exports.getcontact = async (req, res, next) => {
//   try {
//     [rows, fields] = await connection.query(
//       `select * from contact where id  ${req.query.id}`
//     );
//     if (rows.length != 0) {
//       res.status(200).json({ succese: true, items: rows[0] });
//     } else {
//       return next(new ErrorResponse("에러 발생", 418));
//     }
//   } catch (e) {
//     next(new ErrorResponse("에러 발생", 500));
//   }
// };

//@ desc   연락처 추가
//@ route   POST /api/v1/users/insert_phone

exports.insert_phone = async (req, res, next) => {
  let user_id = req.user.id;
  let name = req.body.name;
  let number = req.body.number;
  let shared = req.body.shared;

  let query = `insert into contact(name,phone_number,user_id,shared) values ("${name}","${number}",${user_id},${shared})`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ succese: false, error: e });
  }
};

//@ desc   연락처 수정
//@ route   PUT /api/v1/users/update_phone

exports.update_phone = async (req, res, next) => {
  let user_id = req.user.id;
  let name = req.body.name;
  let number = req.body.number;
  let id = req.body.id;
  let query = `update contact set name = "${name}", phone_number="${number}" where user_id = ${user_id} and id = ${id}`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ succese: false, error: e });
  }
};

//@ desc   연락처 삭제
//@ route   DELELE /api/v1/users/kill_you

exports.delete_you = async (req, res, next) => {
  let user_id = req.user.id;
  let id = req.params.id;

  let query = `delete from contact where user_id = ${user_id} and id = ${id}`;

  try {
    [rows] = await connection.query(query);
    if (rows.affectedRows == 0) {
      res.status(400).json({ message: "그런거 없어" });
      return;
    }
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ succese: false, error: e });
  }
};

// exports == 함수별로 exports한것이다 (공유)

// @desc 이름이나, 전화번호로 검색한API
// @route GET/api/v1/contact/search?/ketword=67
exports.searchcontact = async (req, res, next) => {
  let keyword = req.query.keyword;
  let num = req.query.num;
  let query = `select * from contact where name = "%${keyword}%" or phone_number = "%${num}%" and  shared is null and shared=0 `;
  try {
    [rows, fields] = await connection.query(query);
    res.status(200).json({ succese: true, items: rows });
  } catch (e) {
    res.status(500).json({
      succese: false,
      message: "DB ERROR",
      error: e,
    });
  }
};

// @desc    내가 공유설정 한 연락처만 가져오기
// @route   GET /api/v1/contact/getshared
// @access  Public
exports.getsharedcontacts = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `select*from contact where shared = 1 and user_id = ${user_id}`;
  try {
    const [rows] = await connection.query(query);
    let count = rows.length;
    res.status(200).json({ succese: true, items: rows, count: count });
  } catch (e) {
    res.status(400).json({ error: e });
  }
};

// @desc   공유설정 되어있는 연락처만 전부 가져오기
// @route  GET/api/v1/contact/allshared

exports.allshared = async (req, res, next) => {
  let query = `select * from contact where shared = 1`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};

// @desc   내 연락처 가져오기
// @route  GET/api/v1/contact/mycontact

exports.mycontact = async (req, res, next) => {
  let user_id = req.user.id;
  let query = `select * from contact where user_id = ${user_id}`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, rows: rows });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};
