const connection = require("../db/mysql_connection");

// @desc  내 주소록의 연락처 중, 특정 연락처를, 상대방에게 공유
// @route  POST/api/v1/share
// @request

exports.shared_contact = async (req, res, next) => {
  let user_id = req.user.id;

  let query = `select id,shared from contact where user_id = ${user_id} `;
  try {
    [rows] = await connection.query(query);
    for (let i = 0; i < rows.length; i++) {
      let id = rows[i].id;
      if (rows[i].shared == 1) {
        query = `insert into shared_contact(user_id,share_id) values(${user_id},${id})`;
        try {
          [result] = await connection.query(query);
          res.status(200).json({ success: true, result: result });
          return;
        } catch (e) {
          res.status(500).json({ success: false });
          return;
        }
      }
    }
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

// @ desc  특정 연락처를 공유 및 공유 해제 기능
// @ route  POST/api/v1/shared_on_off
// @ request

exports.shared_on_off = async (req, res, next) => {
  let user_id = req.user.id;
  let id = req.body.id;
  let shared = req.body.shared;
  let query = `update contact set shared = ${shared} where user_id = ${user_id} and id =${id} `;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
