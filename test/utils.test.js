
// eslint-disable-next-line no-unused-vars
const should = require("should");

const utils = require("../src/renderer/utils").default;

describe("Test getIdByURL()", () => {
    before(function () {
    });
    after(function () {
    });
    beforeEach(function () {
    });
    afterEach(function () {
    });

    it("neplaylist", () => {
        utils.getIdByURL("http://music.163.com/#/playlist?id=2098784252")
            .should.equal("neplaylist_2098784252");
    });
    it("neartist", () => {
        utils.getIdByURL("http://music.163.com/#/artist?id=10559")
            .should.equal("neartist_10559");
    });
    it("nealbum", () => {
        utils.getIdByURL("http://music.163.com/#/album?id=37988029")
            .should.equal("nealbum_37988029");
    });


    it("qqplaylist", () => {
        utils.getIdByURL("https://y.qq.com/n/yqq/playsquare/1763974895.html#stat=y_new.playlist.dissname")
            .should.equal("qqplaylist_1763974895");
    });


    it("qqartist", () => {
        utils.getIdByURL("https://y.qq.com/n/yqq/singer/0025NhlN2yWrP4.html#stat=y_new.singerlist.singerpic")
            .should.equal("qqartist_0025NhlN2yWrP4");
    });

    it("qqalbum", () => {
        utils.getIdByURL("https://y.qq.com/n/yqq/album/003T3hnZ11lswD.html#stat=y_new.album_lib.album_name")
            .should.equal("qqalbum_003T3hnZ11lswD");
    });

    it("xmplaylist", () => {
        utils.getIdByURL("http://www.xiami.com/collect/42870089?spm=a1z1s.2943601.6856193.2.azd0nz")
            .should.equal("xmplaylist_42870089");
    });


    it("xmartist", () => {
        utils.getIdByURL("http://www.xiami.com/artist/6in9397a?spm=a1z1s.3057853.6862629.20.MS9yTK")
            .should.equal("xmartist_6in9397a");
    });

    it("xmalbum", () => {
        utils.getIdByURL("http://www.xiami.com/album/nnh6iv73d29?spm=a1z1s.3057849.6862609.9.ky9dfG")
            .should.equal("xmalbum_nnh6iv73d29");
    });

});



