


function locationAlertBack(message) {
    message = config.isTest ? BU.MRF(message) : "알 수 없는 오류가 발생하였습니다.";
    return '<script>alert("' + message + '");history.back(-1);</script>';
}
exports.locationAlertBack = locationAlertBack;

function locationAlertGo(message, page) {
    message = config.isTest ? BU.MRF(message) : "알 수 없는 오류가 발생하였습니다.";
    return '<script>alert("' + message + '");location.href ="' + page + '";</script>';
}
exports.locationAlertGo = locationAlertGo;

function locationJustGo(page) {
    return '<script>location.href ="' + page + '";</script>';
}
exports.locationJustGo = locationJustGo;




function makeResObj(req, sidebarNum, pageCount) {
    var page = BU.checkIntStr(req.query.page) ? req.query.page : 1;
    var search = req.query.search || "";
    var querystring = "search=" + encodeURIComponent(search) + "";
    // BU.CLI(req._parsedOriginalUrl);

    return {
        page: page,
        search: search,
        pageCount: pageCount || 10,
        pathName: req._parsedOriginalUrl.pathname,
        querystring: querystring,
        sidebarNum:sidebarNum,
        err:null
    };
}
exports.makeResObj = makeResObj;

function makePaginationHtml(resObj, queryResult) {
    resObj.list = queryResult.list;
    resObj.totalCount = queryResult.totalCount;
    resObj.pagination = BU.makePagination(resObj);

    return resObj;
}
exports.makePaginationHtml = makePaginationHtml;


