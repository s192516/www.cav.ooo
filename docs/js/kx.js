(function ($) {
    'use strict';
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    var from = getQueryString('from');
    if (from == 'kx') {
        var html = '<div style="position: absolute;top: 0;z-index: 200;"> \
       <a href="https://www.cav.ooo/"> \
        <img style="width: 70px" src="/images/back.png"> \
        </a> \
        </div>';
        $('body').append(html);
    }
})(jQuery);

