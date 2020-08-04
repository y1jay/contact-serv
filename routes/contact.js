const express = require("express");
const auth = require("../middleware/auth");
const {
  getcontacts,

  searchcontact,
  insert_phone,
  update_phone,
  delete_you,
  getsharedcontacts,
  allshared,
  mycontact,
} = require("../controllers/contact");

const router = express.Router();

// 각 경로별로 데이터 가져올 수 있도록, router 셋팅 아래가 라우터 설정
// 원하는 경로에 api를 만들어 주는 것
router.route("/").post(auth, insert_phone).get(getcontacts);
router.route("/update_conatct").put(auth, update_phone);
router.route("/search").get(searchcontact);
router.route("/getshared").get(auth, getsharedcontacts);
router.route("/kill_you/:id").delete(auth, delete_you);
router.route("/allshared").get(allshared);
router.route("/mycontact").get(auth, mycontact);
module.exports = router;
// 너무 많고 복잡해서 폴더로 분리한다.
