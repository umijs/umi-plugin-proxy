const rewrite = require('./rewrite');


module.exports = function (cfg) {
  return {
    * beforeDealHttpsRequest() {
      return true;
    },
    * beforeSendRequest(requestDetail) {
      // let res;

      // rewrite
      return yield rewrite.beforeSendRequest(requestDetail, cfg.rewrite);
    },
    * beforeSendResponse(requestDetail, responseDetail) {
      const res = yield rewrite.beforeSendResponse(requestDetail, responseDetail, cfg.rewrite);
      return res;
    }
  };
};
